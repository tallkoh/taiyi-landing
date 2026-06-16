import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = (req.body ?? {}) as { email?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  try {
    await sql`
      INSERT INTO subscribers (email, type)
      VALUES (${email}, 'subscriber')
      ON CONFLICT (email, type) DO NOTHING
    `;
  } catch (err) {
    console.error('DB insert error', err);
    res.status(500).json({ error: 'Could not save subscription. Try again.' });
    return;
  }

  const transport = createTransport();

  await Promise.all([
    transport.sendMail({
      from: FROM,
      to: email,
      subject: 'Your Taiyi preview is coming Sunday',
      text: `You're on the list.\n\nYou'll receive your first letter this Sunday morning — a weekly almanac combining your bazi with where you live and the qimen calendar.\n\nIf you have questions, reply to this email.\n\n— Taiyi 太乙`,
    }),
    transport.sendMail({
      from: FROM,
      to: process.env.GMAIL_USER,
      subject: `New subscriber — ${email}`,
      text: `Email: ${email}\nTime: ${new Date().toISOString()}`,
    }),
  ]).catch(err => console.error('Mail send error', err));

  res.status(200).json({ ok: true });
}
