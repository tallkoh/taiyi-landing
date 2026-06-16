import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';
import { calculateBazi } from '../lib/bazi.js';
import { generateLetter } from '../lib/letter.js';

interface SubscriberRow {
  email: string;
  dob: string;
  tob: string;
  pob: string;
}

export default async function handler(req: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rows = (await sql`
    SELECT email, dob, tob, pob
      FROM subscribers
     WHERE subscription_status = 'active'
       AND type = 'subscriber'
       AND dob IS NOT NULL
       AND tob IS NOT NULL
       AND (last_sent_at IS NULL OR last_sent_at < now() - INTERVAL '6 days')
  `) as unknown as SubscriberRow[];

  const transport = createTransport();
  let sent = 0;
  let failed = 0;

  for (const sub of rows) {
    try {
      const bazi = calculateBazi(sub.dob, sub.tob, sub.pob);
      const letter = generateLetter(sub.email, bazi);
      await transport.sendMail({
        from: FROM,
        to: sub.email,
        subject: letter.subject,
        text: letter.text,
      });
      await sql`
        UPDATE subscribers
           SET last_sent_at = now()
         WHERE email = ${sub.email}
           AND type = 'subscriber'
      `;
      sent++;
    } catch (err) {
      console.error('Send failed for', sub.email, err);
      failed++;
    }
  }

  return new Response(JSON.stringify({ sent, failed, eligible: rows.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
