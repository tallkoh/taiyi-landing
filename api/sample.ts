import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { calculateBazi } from '../lib/bazi.js';
import { generateLetter, type LetterContext } from '../lib/letter.js';
import { DAY_MASTERS, solarTermDescription } from '../lib/day-master.js';

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

interface StoredRawOutput {
  subject: string;
  sections: { energy: string; focus: string; watch: string; practice: string };
  pillars: { year: string; month: string; day: string; hour: string };
  dayMasterStem: string;
  solarTerm: string;
  topRetrieved: { source: string; content: string } | null;
  name: string;
}

interface ExistingSample {
  id: number;
  subject: string | null;
  raw_output: StoredRawOutput | null;
}

interface SamplePayload {
  ok: true;
  cached: boolean;
  preview: {
    subject: string;
    firstSectionTitle: string;
    firstSectionText: string;
  };
  full: StoredRawOutput & {
    formattedPillars: Array<{ pillar: string; stem: string; branch: string; label: string }>;
    dayMasterInfo: typeof DAY_MASTERS[string] | null;
    solarTermDescription: string;
  };
}

function buildPayload(raw: StoredRawOutput, cached: boolean): SamplePayload {
  const stems: Array<keyof StoredRawOutput['pillars']> = ['year', 'month', 'day', 'hour'];
  const labels = ['Year', 'Month', 'Day', 'Hour'];
  const formattedPillars = stems.map((key, i) => {
    const combined = raw.pillars[key] ?? '';
    return {
      pillar: key,
      label: labels[i],
      stem: combined.charAt(0),
      branch: combined.charAt(1) ?? '',
    };
  });
  return {
    ok: true,
    cached,
    preview: {
      subject: raw.subject,
      firstSectionTitle: "This week's energy",
      firstSectionText: raw.sections.energy ?? '',
    },
    full: {
      ...raw,
      formattedPillars,
      dayMasterInfo: DAY_MASTERS[raw.dayMasterStem] ?? null,
      solarTermDescription: solarTermDescription(raw.solarTerm),
    },
  };
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

  // One sample per email — return the cached structured letter if it exists.
  const existing = (await sql`
    SELECT s.id,
           (SELECT l.subject     FROM letters l WHERE l.subscriber_id = s.id ORDER BY l.generated_at DESC LIMIT 1) AS subject,
           (SELECT l.raw_output  FROM letters l WHERE l.subscriber_id = s.id ORDER BY l.generated_at DESC LIMIT 1) AS raw_output
      FROM subscribers s
     WHERE s.email = ${email} AND s.type = 'sample'
     LIMIT 1
  `) as unknown as ExistingSample[];

  if (existing[0]?.raw_output) {
    res.status(200).json(buildPayload(existing[0].raw_output, true));
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

  const rawOutput: StoredRawOutput = {
    subject: letter.rawOutput.subject,
    sections: letter.rawOutput.sections,
    pillars: {
      year:  `${bazi.year.stem}${bazi.year.branch}`,
      month: `${bazi.month.stem}${bazi.month.branch}`,
      day:   `${bazi.day.stem}${bazi.day.branch}`,
      hour:  `${bazi.hour.stem}${bazi.hour.branch}`,
    },
    dayMasterStem: bazi.dayMaster,
    solarTerm: letter.solarTerm,
    topRetrieved: letter.topRetrieved,
    name,
  };

  const today = new Date().toISOString().slice(0, 10);
  await sql`
    INSERT INTO letters (
      subscriber_id, week_start, subject, body, model,
      input_tokens, output_tokens, cost_usd, status, guardrail_fails, raw_output
    )
    VALUES (
      ${subscriberId}, ${today}, ${letter.subject}, ${letter.body}, ${letter.model},
      ${letter.inputTokens}, ${letter.outputTokens}, ${letter.costUsd},
      'sent', ${letter.guardrailFails as unknown as string},
      ${JSON.stringify(rawOutput)}::jsonb
    )
    ON CONFLICT (subscriber_id, week_start) DO UPDATE
      SET raw_output = EXCLUDED.raw_output
  `;

  console.log(JSON.stringify({
    event: 'sample_generated',
    email,
    name,
    cost_usd: letter.costUsd,
    tokens: letter.inputTokens + letter.outputTokens,
  }));

  res.status(200).json(buildPayload(rawOutput, false));
}
