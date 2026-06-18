import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { verifyPayload } from '../lib/token.js';

const ALLOWED: Record<string, Set<string>> = {
  energy: new Set(['low', 'steady', 'high']),
  focus:  new Set(['work', 'relationships', 'health', 'creativity', 'rest']),
  weight: new Set(['decisions', 'people', 'uncertainty', 'nothing']),
};

function htmlPage(title: string, msg: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { font-family: 'Newsreader', Georgia, serif; max-width: 32rem; margin: 4rem auto; padding: 0 1.5rem; color: #1a1814; line-height: 1.55; background: #f6f0e5; }
  h1 { font-weight: 500; font-size: 1.5rem; margin-bottom: 0.75rem; }
  p  { margin: 0.5rem 0; }
  .sig { font-style: italic; margin-top: 2rem; color: #5a513f; }
</style></head>
<body>
<h1>${title}</h1>
<p>${msg}</p>
<p class="sig">— Taiyi 太乙</p>
</body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const token = typeof req.query.t === 'string' ? req.query.t : Array.isArray(req.query.t) ? req.query.t[0] : '';
  const parts = verifyPayload(token);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!parts || parts.length !== 4) {
    res.status(400).send(htmlPage('Link expired', 'This link is no longer valid. Wait for next week’s questions.'));
    return;
  }

  const [subIdRaw, weekStart, question, choice] = parts;
  const subscriberId = parseInt(subIdRaw, 10);
  if (!Number.isFinite(subscriberId) || !ALLOWED[question] || !ALLOWED[question].has(choice)) {
    res.status(400).send(htmlPage('Link expired', 'This link is no longer valid.'));
    return;
  }

  try {
    if (question === 'energy') {
      await sql`
        UPDATE questionnaire_responses
           SET energy      = ${choice},
               answered_at = COALESCE(answered_at, now())
         WHERE subscriber_id = ${subscriberId}
           AND week_start    = ${weekStart}
      `;
    } else if (question === 'focus') {
      await sql`
        UPDATE questionnaire_responses
           SET focus       = ${choice},
               answered_at = COALESCE(answered_at, now())
         WHERE subscriber_id = ${subscriberId}
           AND week_start    = ${weekStart}
      `;
    } else if (question === 'weight') {
      await sql`
        UPDATE questionnaire_responses
           SET weight      = ${choice},
               answered_at = COALESCE(answered_at, now())
         WHERE subscriber_id = ${subscriberId}
           AND week_start    = ${weekStart}
      `;
    }
  } catch (err) {
    console.error('Answer save failed', err);
    res.status(500).send(htmlPage('Couldn’t save', 'Something broke on our end. Tap again — your latest tap wins.'));
    return;
  }

  res.status(200).send(htmlPage('Got it.', 'Thanks. See you Sunday.'));
}
