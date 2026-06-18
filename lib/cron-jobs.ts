import { sql } from './db.js';
import { createTransport, FROM } from './mailer.js';
import { signPayload, TTL } from './token.js';
import { calculateBazi } from './bazi.js';
import { generateLetter, type LetterContext } from './letter.js';

interface ActiveSubscriber {
  id: number;
  email: string;
}

interface Question {
  id: 'energy' | 'focus' | 'weight';
  prompt: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    prompt: 'How is your energy this week?',
    options: [
      { value: 'low',    label: 'Running low' },
      { value: 'steady', label: 'Steady' },
      { value: 'high',   label: 'High' },
    ],
  },
  {
    id: 'focus',
    prompt: 'Where is your attention pointing?',
    options: [
      { value: 'work',          label: 'Work' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'health',        label: 'Health' },
      { value: 'creativity',    label: 'Creativity' },
      { value: 'rest',          label: 'Rest' },
    ],
  },
  {
    id: 'weight',
    prompt: 'What feels heavy right now?',
    options: [
      { value: 'decisions',   label: 'Decisions' },
      { value: 'people',      label: 'People' },
      { value: 'uncertainty', label: 'Uncertainty' },
      { value: 'nothing',     label: 'Nothing in particular' },
    ],
  },
];

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
}

function mondayOfThisWeekISO(now: Date = new Date()): string {
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function questionBlock(sub: ActiveSubscriber, weekStart: string, q: Question): string {
  const lines = q.options.map(opt => {
    const t = signPayload([sub.id, weekStart, q.id, opt.value], TTL.ANSWER);
    const url = `${siteUrl()}/api/answer?t=${t}`;
    return `  • ${opt.label}: ${url}`;
  }).join('\n');
  return `${q.prompt}\n${lines}`;
}

function buildQuestionnaireEmail(sub: ActiveSubscriber, weekStart: string): { subject: string; text: string } {
  const blocks = QUESTIONS.map(q => questionBlock(sub, weekStart, q)).join('\n\n');
  return {
    subject: 'A few one-tap questions for Sunday',
    text: `Hi,

Three quick taps. Each answer is a clickable link — pick one per question, your latest tap wins. Your answers tune this Sunday's letter.

${blocks}

If you skip any, that's fine — the letter still arrives Sunday.

— Taiyi 太乙
`,
  };
}

export async function runSendQuestionnaire(): Promise<Record<string, unknown>> {
  const weekStart = mondayOfThisWeekISO();
  const rows = (await sql`
    SELECT id, email
      FROM subscribers
     WHERE subscription_status = 'active'
       AND type = 'subscriber'
       AND onboarded_at IS NOT NULL
  `) as unknown as ActiveSubscriber[];

  const transport = createTransport();
  let sent = 0;
  let failed = 0;

  for (const sub of rows) {
    try {
      await sql`
        INSERT INTO questionnaire_responses (subscriber_id, week_start)
        VALUES (${sub.id}, ${weekStart})
        ON CONFLICT (subscriber_id, week_start) DO NOTHING
      `;
      const mail = buildQuestionnaireEmail(sub, weekStart);
      await transport.sendMail({ from: FROM, to: sub.email, subject: mail.subject, text: mail.text });
      sent++;
    } catch (err) {
      console.error('Questionnaire send failed for', sub.email, err);
      failed++;
    }
  }

  return { sent, failed, eligible: rows.length, weekStart };
}

interface EligibleRow {
  id: number;
  email: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string | null;
  current_country: string | null;
}

interface PulseRow {
  energy: string | null;
  focus: string | null;
  weight: string | null;
}

interface RecentRow {
  subject: string;
  body: string;
}

function normalizeGender(g: string | null): LetterContext['gender'] {
  if (g === 'm' || g === 'f' || g === 'nb') return g;
  return 'unspecified';
}

function normalizePulse(p: string | null, allowed: string[]): string | undefined {
  if (!p) return undefined;
  return allowed.includes(p) ? p : undefined;
}

export async function runGenerateLetters(): Promise<Record<string, unknown>> {
  const weekStart = mondayOfThisWeekISO();

  const eligible = (await sql`
    SELECT s.id, s.email, s.dob, s.tob, s.pob, s.gender, s.current_country
      FROM subscribers s
      LEFT JOIN letters l
        ON l.subscriber_id = s.id
       AND l.week_start    = ${weekStart}
     WHERE s.subscription_status = 'active'
       AND s.type = 'subscriber'
       AND s.onboarded_at IS NOT NULL
       AND s.dob IS NOT NULL
       AND s.tob IS NOT NULL
       AND l.id IS NULL
  `) as unknown as EligibleRow[];

  let approved = 0;
  let flagged = 0;
  let errored = 0;

  for (const sub of eligible) {
    try {
      const bazi = calculateBazi(sub.dob, sub.tob, sub.pob);

      const pulseRows = (await sql`
        SELECT energy, focus, weight
          FROM questionnaire_responses
         WHERE subscriber_id = ${sub.id}
           AND week_start    = ${weekStart}
         LIMIT 1
      `) as unknown as PulseRow[];
      const pulse = pulseRows[0] ?? { energy: null, focus: null, weight: null };

      const recent = (await sql`
        SELECT subject, body
          FROM letters
         WHERE subscriber_id = ${sub.id}
           AND status IN ('approved', 'sent')
         ORDER BY week_start DESC
         LIMIT 2
      `) as unknown as RecentRow[];

      const ctx: LetterContext = {
        subscriberId: sub.id,
        email: sub.email,
        bazi,
        gender: normalizeGender(sub.gender),
        currentCountry: sub.current_country ?? '',
        energy: normalizePulse(pulse.energy, ['low', 'steady', 'high']) as LetterContext['energy'],
        focus:  normalizePulse(pulse.focus,  ['work', 'relationships', 'health', 'creativity', 'rest']) as LetterContext['focus'],
        weight: normalizePulse(pulse.weight, ['decisions', 'people', 'uncertainty', 'nothing']) as LetterContext['weight'],
        recentSubjects: recent.map(r => r.subject),
        recentBodies:   recent.map(r => r.body),
      };

      const letter = await generateLetter(ctx);

      await sql`
        INSERT INTO letters (
          subscriber_id, week_start, subject, body, model,
          input_tokens, output_tokens, cost_usd, status, guardrail_fails
        )
        VALUES (
          ${sub.id}, ${weekStart}, ${letter.subject}, ${letter.body}, ${letter.model},
          ${letter.inputTokens}, ${letter.outputTokens}, ${letter.costUsd},
          ${letter.status}, ${letter.guardrailFails as unknown as string}
        )
        ON CONFLICT (subscriber_id, week_start) DO NOTHING
      `;

      console.log(JSON.stringify({
        event: 'letter_generated',
        subscriber_id: sub.id,
        week_start: weekStart,
        model: letter.model,
        input_tokens: letter.inputTokens,
        output_tokens: letter.outputTokens,
        cost_usd: letter.costUsd,
        status: letter.status,
        guardrail_fails: letter.guardrailFails,
      }));

      if (letter.status === 'approved') approved++;
      else flagged++;
    } catch (err) {
      console.error('Generation error for sub', sub.id, err);
      errored++;
    }
  }

  return { eligible: eligible.length, approved, flagged, errored, weekStart };
}

interface QueuedLetter {
  id: number;
  subscriber_id: number;
  email: string;
  subject: string;
  body: string;
}

export async function runSendWeekly(): Promise<Record<string, unknown>> {
  const weekStart = mondayOfThisWeekISO();

  const queued = (await sql`
    SELECT l.id, l.subscriber_id, s.email, l.subject, l.body
      FROM letters l
      JOIN subscribers s ON s.id = l.subscriber_id
     WHERE l.week_start = ${weekStart}
       AND l.status     = 'approved'
       AND l.sent_at    IS NULL
       AND s.subscription_status = 'active'
       AND s.delete_requested_at IS NULL
  `) as unknown as QueuedLetter[];

  const transport = createTransport();
  let sent = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      await transport.sendMail({
        from: FROM,
        to: item.email,
        subject: item.subject,
        text: item.body,
      });
      await sql`UPDATE letters SET sent_at = now(), status = 'sent' WHERE id = ${item.id}`;
      await sql`UPDATE subscribers SET last_sent_at = now() WHERE id = ${item.subscriber_id}`;
      sent++;
    } catch (err) {
      console.error('Send failed for letter', item.id, err);
      await sql`UPDATE letters SET status = 'failed' WHERE id = ${item.id}`;
      failed++;
    }
  }

  return { sent, failed, queued: queued.length, weekStart };
}
