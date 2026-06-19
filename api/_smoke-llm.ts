// TEMPORARY smoke-test endpoint. Verifies Vercel→OpenAI works end-to-end
// without needing a real subscriber row. Remove after one-shot verification.
// Underscore prefix keeps it out of the Vercel auto-discovered crons.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateLetter, type LetterContext } from '../lib/letter.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const ctx: LetterContext = {
    subscriberId: 0,
    email: 'smoke@example.com',
    bazi: {
      year:  { stem: '庚', branch: '午' },
      month: { stem: '壬', branch: '午' },
      day:   { stem: '甲', branch: '子' },
      hour:  { stem: '丙', branch: '寅' },
      dayMaster: '甲',
    },
    gender: 'f',
    currentCountry: 'SG',
    energy: 'low',
    focus: 'work',
    weight: 'decisions',
    recentSubjects: [],
    recentBodies: [],
  };

  try {
    const start = Date.now();
    const letter = await generateLetter(ctx);
    const elapsedMs = Date.now() - start;
    res.status(200).json({
      ok: true,
      elapsedMs,
      model: letter.model,
      status: letter.status,
      guardrailFails: letter.guardrailFails,
      inputTokens: letter.inputTokens,
      outputTokens: letter.outputTokens,
      costUsd: letter.costUsd,
      subject: letter.subject,
      bodyPreview: letter.body.slice(0, 600),
    });
  } catch (err) {
    console.error('Smoke LLM call failed', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
