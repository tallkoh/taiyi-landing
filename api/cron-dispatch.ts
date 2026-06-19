import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runSendQuestionnaire, runGenerateLetters, runSendWeekly } from '../lib/cron-jobs.js';

// Vercel Hobby caps cron entries at 2/project AND each schedule must be
// at most once-per-day. This dispatcher fires once daily at 22:00 UTC and
// runs the right weekly job based on day-of-week. Skips on the other 4 days.
//
// Schedule (in vercel.json):
//   { path: "/api/cron-dispatch", schedule: "0 22 * * *" }
//
// Day-of-week → job:
//   Wed → send-questionnaire   (mid-week pulse)
//   Sat → generate-letters     (LLM batch, 24h before send)
//   Sun → send-weekly          (the letter itself)
//
// For manual testing: ?job=questionnaire|generate|send overrides day-of-week.

const JOBS: Record<string, () => Promise<Record<string, unknown>>> = {
  questionnaire: runSendQuestionnaire,
  generate:      runGenerateLetters,
  send:          runSendWeekly,
};

const DOW_TO_JOB: Record<number, keyof typeof JOBS> = {
  3: 'questionnaire',
  6: 'generate',
  0: 'send',
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const forceFromQuery = typeof req.query.job === 'string' ? req.query.job : '';
  const forceFromHeader = typeof req.headers['x-job'] === 'string' ? req.headers['x-job'] : '';
  const force = forceFromQuery || forceFromHeader;
  const dow = new Date().getUTCDay();
  const jobKey = force || DOW_TO_JOB[dow];

  if (!jobKey || !JOBS[jobKey]) {
    res.status(200).json({ skipped: true, dow });
    return;
  }

  try {
    const result = await JOBS[jobKey]();
    res.status(200).json({ job: jobKey, ...result });
  } catch (err) {
    console.error('Cron job failed', jobKey, err);
    res.status(500).json({ job: jobKey, error: 'Job failed' });
  }
}
