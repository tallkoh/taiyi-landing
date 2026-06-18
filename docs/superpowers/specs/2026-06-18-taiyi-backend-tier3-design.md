# Taiyi Backend Tier 3 — Accounts, Pulse, LLM Letters

**Date:** 2026-06-18
**Status:** Approved (CEO ack)
**Supersedes parts of:** the stub `lib/letter.ts` and the email-only entry flow.

## Goal

Wire the product end-to-end so a paying subscriber goes from Stripe checkout to a personalized, LLM-generated weekly letter — with a mid-week pulse questionnaire that tunes each letter's voice. No new infra; everything stays on Vercel Fluid Compute + Neon + Gmail SMTP.

## Decisions locked

| Decision | Choice | Why |
|---|---|---|
| Hosting | Vercel Fluid Compute (existing) | 300s timeout, full Node.js, $0 incremental |
| Auth | Clerk (`@clerk/clerk-js` + `@clerk/backend`) | Free up to 10k MAU; user requested it |
| Signup order | Pay first → Clerk + profile | Lowest top-of-funnel friction |
| Questionnaire | 1-tap email, 3 multiple-choice questions, tokenized GETs | Highest answer rate; no auth needed |
| Letter format | Loose template w/ 4 named sections | Predictable, QA-able, on-brand |
| Review gate | Auto-send with guardrails | Scales past founder time |
| LLM | OpenAI GPT-5.4 via direct `openai` SDK | One model, one provider; gateway is overkill |
| Cost ceiling | `MAX_LETTER_COST_USD=0.10` env-tunable | Runaway protection |

## Architecture

```
                    Vite static landing (existing)
                              │
                              ▼
                       Stripe Checkout
                              │
       webhook ◄──────────────┴───────────────────►  success_url
   (saves stripe_session_id)                    /onboarding?session_id=…
                                                       │
                                                       ▼
                                       Clerk SignUp (email prefilled)
                                                       │
                                                       ▼
                                           Profile form (DOB/TOB/POB,
                                                   country, gender)
                                                       │
                                                       ▼
                                       POST /api/profile
                                       (verify Clerk token,
                                        link clerk_user_id,
                                        send welcome email)
                                                       │
                                                       ▼
                                       Wed cron → /api/send-questionnaire
                                                       │
                                       3 tokenized GET links per email
                                                       │
                                                       ▼
                                       GET /api/answer?t=… (no auth)
                                                       │
                                                       ▼
                                       Sat 04:00 cron → /api/generate-letters
                                       (OpenAI GPT-5.4 + guardrails →
                                        letters table)
                                                       │
                                                       ▼
                                       Sun 22:00 cron → /api/send-weekly
                                       (read approved letters, send,
                                        mark sent_at)
```

## Data model

### Subscribers — additive columns

```sql
ALTER TABLE subscribers ADD COLUMN clerk_user_id     TEXT UNIQUE;
ALTER TABLE subscribers ADD COLUMN gender            TEXT;        -- 'm' | 'f' | 'nb' | 'unspecified'
ALTER TABLE subscribers ADD COLUMN current_country   TEXT;        -- ISO-3166 alpha-2
ALTER TABLE subscribers ADD COLUMN onboarded_at      TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN stripe_session_id TEXT;        -- post-pay linking

CREATE INDEX IF NOT EXISTS subscribers_active_onboarded_idx
  ON subscribers (subscription_status, onboarded_at)
  WHERE subscription_status = 'active' AND onboarded_at IS NOT NULL;
```

### New tables

```sql
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id             SERIAL PRIMARY KEY,
  subscriber_id  INT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,   -- Monday of the week
  energy         TEXT,            -- low | steady | high
  focus          TEXT,            -- work | relationships | health | creativity | rest
  weight         TEXT,            -- decisions | people | uncertainty | nothing
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at    TIMESTAMPTZ,
  UNIQUE (subscriber_id, week_start)
);

CREATE TABLE IF NOT EXISTS letters (
  id              SERIAL PRIMARY KEY,
  subscriber_id   INT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_tokens    INT,
  output_tokens   INT,
  cost_usd        NUMERIC(10,6),
  status          TEXT NOT NULL,   -- approved | flagged | sent | failed
  guardrail_fails TEXT[],
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  UNIQUE (subscriber_id, week_start)
);

CREATE INDEX IF NOT EXISTS letters_send_queue_idx
  ON letters (week_start, status)
  WHERE status = 'approved' AND sent_at IS NULL;
```

Both `ON DELETE CASCADE` so PDPA hard-delete in the daily cleanup wipes all child rows.

## Endpoints

| Path | Method | Auth | Purpose |
|---|---|---|---|
| `/api/checkout` | POST | none | (updated) success_url → `/onboarding?session_id=…` |
| `/api/stripe-webhook` | POST | Stripe sig | (updated) save `stripe_session_id` on subscriber row |
| `/api/profile` | POST | Clerk session token | new — link Clerk user → subscriber, store DOB/TOB/POB/country/gender, send welcome |
| `/api/send-questionnaire` | GET | `Bearer CRON_SECRET` | new — Wed cron, send 3-question email |
| `/api/answer` | GET | HMAC token in query | new — record one answer, render confirmation HTML |
| `/api/generate-letters` | GET | `Bearer CRON_SECRET` | new — Sat cron, generate via OpenAI, run guardrails, INSERT into letters |
| `/api/send-weekly` | GET | `Bearer CRON_SECRET` | (rewritten) read approved letters for current week, send |

## LLM pipeline (`lib/letter.ts`)

### Input shape

```ts
interface LetterContext {
  subscriberId: number;
  email: string;
  pillars: { year: string; month: string; day: string; hour: string };
  dayMaster: string;
  weekStart: string;
  weekEnd: string;
  solarTerm: string;
  gender: 'm' | 'f' | 'nb' | 'unspecified';
  currentCountry: string;
  energy?: 'low' | 'steady' | 'high';
  focus?: 'work' | 'relationships' | 'health' | 'creativity' | 'rest';
  weight?: 'decisions' | 'people' | 'uncertainty' | 'nothing';
  recentSubjects: string[];   // last 2 letters' subjects for continuity
}
```

### Output shape (OpenAI structured output)

```ts
interface LetterOutput {
  subject: string;
  sections: {
    energy: string;     // "This week's energy"  — 2–3 sentences
    focus: string;      // "What to focus on"    — 2–3 sentences
    watch: string;      // "What to watch for"   — 2–3 sentences
    practice: string;   // "A small practice"    — 1–2 sentences
  };
}
```

The module assembles the final email body from `sections` + the existing unsubscribe/delete footer. **The LLM never generates the footer** — that stays in code where token signing happens.

### Guardrails (`lib/guardrails.ts`)

Run after generation, before INSERT:

| Check | Rule | Fail action |
|---|---|---|
| `structure` | All 4 sections present, non-empty | flag |
| `word_count` | Total body words 180–600 | flag |
| `section_length` | Each section 1–4 sentences | flag |
| `forbidden_terms` | No "diagnose", "guarantee", "invest", stock tickers, named individuals | flag |
| `hallucinated_date` | No dates outside this week's range | flag |
| `repeat_prevention` | Bag-of-words cosine vs. last 2 letters < 0.85 | flag |
| `cost_ceiling` | This call's USD cost < `MAX_LETTER_COST_USD` | flag |

Failed guardrails → `status='flagged'`, `guardrail_fails={...}`. Sun cron only sends `status='approved'`.

### Retries + observability

- One retry on OpenAI 5xx / timeout, then write `status='flagged'` with `guardrail_fails={'generation_failed'}`
- Log `{subscriber_id, week_start, model, input_tokens, output_tokens, cost_usd, latency_ms, guardrail_fails}` per generation

## Cron schedule (`vercel.json`)

| Cron | Path | Time (UTC) |
|---|---|---|
| Daily | `/api/delete-cleanup` | `0 3 * * *` (existing) |
| Wed | `/api/send-questionnaire` | `0 14 * * 3` (new) |
| Sat | `/api/generate-letters` | `0 4 * * 6` (new) |
| Sun | `/api/send-weekly` | `0 22 * * 0` (existing, rewired) |

## Environment variables

New:
```
CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.4
MAX_LETTER_COST_USD=0.10
```

Existing (unchanged): `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `SITE_URL`.

## Edge cases handled

- **Pays but never signs up** — reminder emails at 24h / 72h / weekly, keyed on `onboarded_at IS NULL AND created_at < now() - X`. (Reminder emails: Tier 3.5; not blocking initial ship.)
- **Answers 0 of 3 questions** — letter still generates; LLM gets nulls and writes more generic prose.
- **Answers same question twice** — last write wins.
- **Onboarding page reloaded after Clerk signup** — `/api/profile` is idempotent upsert.
- **Subscriber dob/tob/pob is null** — `generate-letters` skips them (matches existing `send-weekly` filter).

## Out of scope for this tier

- Per-subscriber timezone delivery windows
- Place-of-birth geocoding for true solar time
- Admin review dashboard for flagged letters (SQL it manually until Tier 4)
- Subscriber dashboard for editing birth data or pausing
- Letter history archive UI
- Re-generation button for flagged letters

## Risks

- **OpenAI rate limits / outages on Saturday.** Mitigation: Sat 04:00 UTC gives 42-hour buffer before Sun send. If full failure, Sunday goes out short (`flagged` count surfaces in logs).
- **Clerk → subscriber identity drift.** If user signs up at Clerk with a different email than they paid with at Stripe, `/api/profile` rejects. UX: surface a "your account email must match the email you paid with" error.
- **GPT-5.4 cost spike.** Guardrail kills any single call > `MAX_LETTER_COST_USD`. Per-letter cost stored in DB for trend analysis.
