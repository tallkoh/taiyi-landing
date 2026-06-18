import type { FourPillars } from './bazi.js';
import { currentSolarTerm } from './bazi.js';
import { signToken, TTL } from './token.js';
import { openai, modelName, costUsd } from './openai.js';
import { runGuardrails, type LetterOutput } from './guardrails.js';
import { corpusDigest, retrieve, type RetrievedNote } from './knowledge.js';

export interface Letter {
  subject: string;
  text: string;
}

export interface LetterContext {
  subscriberId: number;
  email: string;
  bazi: FourPillars;
  gender: 'm' | 'f' | 'nb' | 'unspecified';
  currentCountry: string;
  energy?: 'low' | 'steady' | 'high';
  focus?: 'work' | 'relationships' | 'health' | 'creativity' | 'rest';
  weight?: 'decisions' | 'people' | 'uncertainty' | 'nothing';
  recentSubjects: string[];
  recentBodies: string[];
}

export interface GeneratedLetter {
  subject: string;
  body: string;
  rawOutput: LetterOutput;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  status: 'approved' | 'flagged';
  guardrailFails: string[];
}

function weekRange(now: Date = new Date()): { startISO: string; endISO: string; label: string } {
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const human = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return {
    startISO: iso(monday),
    endISO: iso(sunday),
    label: `${human(monday)} – ${human(sunday)}`,
  };
}

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
}

function footer(email: string): string {
  const unsubUrl = `${siteUrl()}/api/unsubscribe?t=${signToken(email, TTL.UNSUBSCRIBE)}`;
  return `────────────────────────────────────────────
To stop receiving these letters and cancel your subscription, click:
${unsubUrl}

To request deletion of your data (PDPA), visit ${siteUrl()}/delete
`;
}

function buildSystemPrompt(): string {
  return `You are Taiyi 太乙, a contemporary writer rooted in Chinese metaphysics — bazi (four pillars), the solar calendar, and qimen. You write weekly letters to one subscriber at a time. The register is calm, grounded, and personal — like a senior friend who happens to know the system. Never grandiose. Never wellness-jargon. Never astrology clichés.

You receive a context bundle with the reader's four pillars, day master, the current solar term, their current country, gender, and (optionally) their answers to a short mid-week pulse questionnaire. Some pulse answers may be missing — write more generally when they are.

You also receive (a) a fixed corpus overview describing the body of Chinese metaphysics teachings available to you, and (b) a small set of source-attributed teaching notes selected for this reader's chart and week. Ground your writing in those notes: prefer concepts, vocabulary, and frames that appear in them over inventing new ones. Do not quote the notes verbatim. Do not cite sources to the reader. Translate any classical terms briefly on first use.

Hard rules:
- No medical, legal, or financial advice. Do not name medications, conditions, lawyers, investments, or stock tickers.
- No specific dated predictions outside the current week's range.
- Do not name any individual people (no celebrities, no public figures, no friends, no teachers from the source notes).
- Do not invent biographical facts about the reader you weren't given.
- Do not use the words "diagnose", "guarantee", or numbered ratings.
- Use simple English. Translate any Chinese terms briefly on first use.

Output JSON matching the provided schema. Each section is 1–4 sentences. Total body 200–500 words. The subject line is 4–9 words, no emoji, no colons.

──────────── CORPUS OVERVIEW ────────────
${corpusDigest()}
─────────────────────────────────────────`;
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'sections'],
  properties: {
    subject: { type: 'string' },
    sections: {
      type: 'object',
      additionalProperties: false,
      required: ['energy', 'focus', 'watch', 'practice'],
      properties: {
        energy:   { type: 'string', description: "This week's energy. 2–3 sentences." },
        focus:    { type: 'string', description: 'What to focus on this week. 2–3 sentences.' },
        watch:    { type: 'string', description: 'What to watch for this week. 2–3 sentences.' },
        practice: { type: 'string', description: 'One concrete small practice. 1–2 sentences.' },
      },
    },
  },
} as const;

function formatRetrieved(notes: RetrievedNote[]): string {
  if (notes.length === 0) return '(no source notes matched this chart and week)';
  return notes.map((n, i) => `[note ${i + 1}] (${n.source})\n${n.content}`).join('\n\n');
}

function buildUserPrompt(
  ctx: LetterContext,
  week: { startISO: string; endISO: string; label: string },
  solarTerm: string,
  retrieved: RetrievedNote[],
): string {
  const pillars = `${ctx.bazi.year.stem}${ctx.bazi.year.branch} · ${ctx.bazi.month.stem}${ctx.bazi.month.branch} · ${ctx.bazi.day.stem}${ctx.bazi.day.branch} · ${ctx.bazi.hour.stem}${ctx.bazi.hour.branch}`;
  const pulse = [
    ctx.energy ? `- energy: ${ctx.energy}` : '- energy: (not answered)',
    ctx.focus  ? `- focus: ${ctx.focus}`   : '- focus: (not answered)',
    ctx.weight ? `- weight: ${ctx.weight}` : '- weight: (not answered)',
  ].join('\n');
  const recent = ctx.recentSubjects.length
    ? ctx.recentSubjects.map(s => `- "${s}"`).join('\n')
    : '(none — this is the first letter)';
  return `Reader context for the week of ${week.label} (${week.startISO} to ${week.endISO}):

Four pillars: ${pillars}
Day master: ${ctx.bazi.dayMaster}
Current solar term: ${solarTerm}
Current country: ${ctx.currentCountry || 'unspecified'}
Gender: ${ctx.gender}

Mid-week pulse:
${pulse}

Recent letter subjects (avoid repeating their language):
${recent}

──── Source notes for grounding (do not quote, do not cite) ────
${formatRetrieved(retrieved)}
─────────────────────────────────────────────────────────────────

Write this week's letter. Output JSON only.`;
}

function assembleBody(out: LetterOutput, weekLabel: string, email: string): string {
  return `Dear reader,

Your week of ${weekLabel}.

This week's energy
${out.sections.energy}

What to focus on
${out.sections.focus}

What to watch for
${out.sections.watch}

A small practice
${out.sections.practice}

— Taiyi 太乙
  Singapore

${footer(email)}`;
}

// Generates a letter via OpenAI, runs guardrails, returns a normalized
// record ready for INSERT into the letters table. On unrecoverable
// generation failure, returns a flagged record with empty body — the
// caller (generate-letters cron) still inserts it so we can see what
// happened in admin/SQL.
export async function generateLetter(ctx: LetterContext): Promise<GeneratedLetter> {
  const week = weekRange();
  const solarTerm = currentSolarTerm();
  const model = modelName();

  const retrieved = retrieve({
    dayMasterStem: ctx.bazi.dayMaster,
    solarTerm,
    energy: ctx.energy,
    focus: ctx.focus,
    weight: ctx.weight,
  });

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(ctx, week, solarTerm, retrieved);

  let output: LetterOutput | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let attempt = 0;

  while (attempt < 2 && !output) {
    attempt++;
    try {
      const resp = await openai().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'letter', strict: true, schema: SCHEMA as Record<string, unknown> },
        },
      });
      inputTokens = resp.usage?.prompt_tokens ?? 0;
      outputTokens = resp.usage?.completion_tokens ?? 0;
      const raw = resp.choices[0]?.message?.content ?? '';
      output = JSON.parse(raw) as LetterOutput;
    } catch (err) {
      console.error(`OpenAI attempt ${attempt} failed for sub ${ctx.subscriberId}`, err);
    }
  }

  if (!output) {
    return {
      subject: '(generation failed)',
      body: '',
      rawOutput: { subject: '', sections: { energy: '', focus: '', watch: '', practice: '' } },
      model,
      inputTokens,
      outputTokens,
      costUsd: costUsd(model, inputTokens, outputTokens),
      status: 'flagged',
      guardrailFails: ['generation_failed'],
    };
  }

  const cost = costUsd(model, inputTokens, outputTokens);
  const { pass, fails } = runGuardrails({
    output,
    costUsd: cost,
    recentBodies: ctx.recentBodies,
    weekStartISO: week.startISO,
    weekEndISO: week.endISO,
  });

  const body = assembleBody(output, week.label, ctx.email);

  return {
    subject: `Taiyi · ${output.subject}`,
    body,
    rawOutput: output,
    model,
    inputTokens,
    outputTokens,
    costUsd: cost,
    status: pass ? 'approved' : 'flagged',
    guardrailFails: fails,
  };
}
