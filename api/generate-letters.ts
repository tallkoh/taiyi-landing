import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { calculateBazi } from '../lib/bazi.js';
import { generateLetter, type LetterContext } from '../lib/letter.js';

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

function mondayOfThisWeekISO(now: Date = new Date()): string {
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function normalizeGender(g: string | null): LetterContext['gender'] {
  if (g === 'm' || g === 'f' || g === 'nb') return g;
  return 'unspecified';
}

function normalizePulse(p: string | null, allowed: string[]): string | undefined {
  if (!p) return undefined;
  return allowed.includes(p) ? p : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const weekStart = mondayOfThisWeekISO();

  // Only subscribers who finished onboarding and don't already have a letter this week.
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

  res.status(200).json({ eligible: eligible.length, approved, flagged, errored, weekStart });
}
