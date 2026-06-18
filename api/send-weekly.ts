import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';

interface QueuedLetter {
  id: number;
  subscriber_id: number;
  email: string;
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

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
      await sql`
        UPDATE letters
           SET sent_at = now(),
               status  = 'sent'
         WHERE id = ${item.id}
      `;
      await sql`
        UPDATE subscribers
           SET last_sent_at = now()
         WHERE id = ${item.subscriber_id}
      `;
      sent++;
    } catch (err) {
      console.error('Send failed for letter', item.id, err);
      await sql`
        UPDATE letters
           SET status = 'failed'
         WHERE id = ${item.id}
      `;
      failed++;
    }
  }

  res.status(200).json({ sent, failed, queued: queued.length, weekStart });
}
