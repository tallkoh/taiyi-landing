import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Hobby caps cron entries at 2/project AND each schedule must be
// at most once-per-day. This dispatcher fires once daily at 22:00 UTC and
// forwards to the right weekly endpoint based on day-of-week. Skips on
// the other 4 days of the week.
//
// Schedule (in vercel.json):
//   { path: "/api/cron-dispatch", schedule: "0 22 * * *" }
//
// Day-of-week → endpoint mapping:
//   Wed → /api/send-questionnaire   (mid-week pulse)
//   Sat → /api/generate-letters     (LLM batch, 24h before send)
//   Sun → /api/send-weekly          (the letter itself)

const TARGETS: Record<number, string> = {
  3: '/api/send-questionnaire',
  6: '/api/generate-letters',
  0: '/api/send-weekly',
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
  const path = TARGETS[dow];

  if (!path) {
    res.status(200).json({ skipped: true, dow });
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
