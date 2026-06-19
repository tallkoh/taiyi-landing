import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { calculateBazi } from '../lib/bazi.js';
import { generateLetter, type LetterContext } from '../lib/letter.js';

interface SampleBody {
  name?: unknown;
  email?: unknown;
  dob?: unknown;
  tob?: unknown;
  tobUnknown?: unknown;
  pob?: unknown;
  currentCountry?: unknown;
  gender?: unknown;
  energy?: unknown;
  focus?: unknown;
  weight?: unknown;
}

const ENERGY = new Set(['low', 'steady', 'high']);
const FOCUS = new Set(['work', 'relationships', 'health', 'creativity', 'rest']);
const WEIGHT = new Set(['decisions', 'people', 'uncertainty', 'nothing']);
const GENDER = new Set(['m', 'f', 'nb', 'unspecified']);

function str(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function oneOf(v: unknown, allowed: Set<string>): string {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return allowed.has(s) ? s : '';
}

interface ExistingSample {
  id: number;
  subject: string | null;
  body: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const body = (req.body ?? {}) as SampleBody;
  const name = str(body.name, 80);
  const email = str(body.email, 200).toLowerCase();
  const dob = str(body.dob, 20);
  const tob = body.tobUnknown ? '12:00' : str(body.tob, 20);
  const pob = str(body.pob, 200);
  const currentCountry = str(body.currentCountry, 2).toUpperCase();
  const gender = oneOf(body.gender, GENDER) || 'unspecified';
  const energy = oneOf(body.energy, ENERGY);
  const focus = oneOf(body.focus, FOCUS);
  const weight = oneOf(body.weight, WEIGHT);

  if (!name || !email || !dob || !tob || !pob || !currentCountry) {
    res.status(400).json({ error: 'Please fill in every field.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'That email looks off.' });
    return;
  }

  // One sample per email. If they've already used it, return the saved letter
  // rather than burning another OpenAI call.
  const existing = (await sql`
    SELECT s.id,
           (SELECT l.subject FROM letters l WHERE l.subscriber_id = s.id ORDER BY l.generated_at DESC LIMIT 1) AS subject,
           (SELECT l.body    FROM letters l WHERE l.subscriber_id = s.id ORDER BY l.generated_at DESC LIMIT 1) AS body
      FROM subscribers s
     WHERE s.email = ${email} AND s.type = 'sample'
     LIMIT 1
  `) as unknown as ExistingSample[];

  if (existing[0]?.body) {
    res.status(200).json({
      ok: true,
      cached: true,
      subject: existing[0].subject,
      body: existing[0].body,
    });
    return;
  }

  let bazi;
  try {
    bazi = calculateBazi(dob, tob, pob);
  } catch (err) {
    console.error('Bazi calc failed', err);
    res.status(400).json({ error: 'Could not parse that date or time. Try YYYY-MM-DD and HH:MM.' });
    return;
  }

  const subRows = (await sql`
    INSERT INTO subscribers (email, type, dob, tob, pob, gender, current_country)
    VALUES (${email}, 'sample', ${dob}, ${tob}, ${pob}, ${gender}, ${currentCountry})
    ON CONFLICT (email, type) DO UPDATE
      SET dob = EXCLUDED.dob, tob = EXCLUDED.tob, pob = EXCLUDED.pob,
          gender = EXCLUDED.gender, current_country = EXCLUDED.current_country
    RETURNING id
  `) as unknown as { id: number }[];
  const subscriberId = subRows[0].id;

  const ctx: LetterContext = {
    subscriberId,
    email,
    bazi,
    gender: gender as LetterContext['gender'],
    currentCountry,
    energy: energy as LetterContext['energy'],
    focus:  focus as LetterContext['focus'],
    weight: weight as LetterContext['weight'],
    recentSubjects: [],
    recentBodies: [],
  };

  const letter = await generateLetter(ctx);

  if (letter.status !== 'approved') {
    console.error('Sample letter flagged', { email, fails: letter.guardrailFails });
    res.status(500).json({ error: 'Our writer is taking a moment. Try again in a minute.' });
    return;
  }

  // Use today's date as week_start, not Monday — keeps sample rows out of the
  // Sunday send-weekly query (which filters type='subscriber' anyway, but
  // belt + braces).
  const today = new Date().toISOString().slice(0, 10);
  await sql`
    INSERT INTO letters (
      subscriber_id, week_start, subject, body, model,
      input_tokens, output_tokens, cost_usd, status, guardrail_fails
    )
    VALUES (
      ${subscriberId}, ${today}, ${letter.subject}, ${letter.body}, ${letter.model},
      ${letter.inputTokens}, ${letter.outputTokens}, ${letter.costUsd},
      'sent', ${letter.guardrailFails as unknown as string}
    )
    ON CONFLICT (subscriber_id, week_start) DO NOTHING
  `;

  console.log(JSON.stringify({
    event: 'sample_generated',
    email,
    name,
    cost_usd: letter.costUsd,
    tokens: letter.inputTokens + letter.outputTokens,
  }));

  res.status(200).json({
    ok: true,
    cached: false,
    subject: letter.subject,
    body: letter.body,
  });
}
