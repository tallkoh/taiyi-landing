import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Hobby caps at 2 cron entries per project. This dispatcher fires
// at 04:00, 14:00, and 22:00 UTC every day, then forwards to the right
// weekly endpoint based on day-of-week + hour. Skips silently at other times.
//
// Schedule (in vercel.json):
//   { path: "/api/cron-dispatch", schedule: "0 4,14,22 * * *" }
//
// Day-of-week → endpoint mapping:
//   Wed 14:00 UTC → /api/send-questionnaire
//   Sat 04:00 UTC → /api/generate-letters
//   Sun 22:00 UTC → /api/send-weekly

const TARGETS: Record<string, string> = {
  '3:14': '/api/send-questionnaire', // Wednesday 14:00 UTC
  '6:4':  '/api/generate-letters',   // Saturday 04:00 UTC
  '0:22': '/api/send-weekly',        // Sunday 22:00 UTC
};

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const now = new Date();
  const dow = now.getUTCDay();      // 0=Sun ... 6=Sat
  const hour = now.getUTCHours();
  const key = `${dow}:${hour}`;
  const path = TARGETS[key];

  if (!path) {
    res.status(200).json({ skipped: true, dow, hour });
    return;
  }

  try {
    const r = await fetch(`${siteUrl()}${path}`, {
      method: 'GET',
      headers: { Authorization: authHeader },
    });
    const text = await r.text();
    let body: unknown = text;
    try { body = JSON.parse(text); } catch { /* keep as text */ }
    res.status(r.status).json({ dispatched: path, status: r.status, body });
  } catch (err) {
    console.error('Cron dispatch fetch failed', path, err);
    res.status(500).json({ error: 'Dispatch failed', path });
  }
}
