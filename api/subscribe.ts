import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let email: string;
  try {
    const body = await req.json() as { email?: unknown };
    email = typeof body.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  if (!email) return json({ error: 'Email required' }, 400);

  try {
    await sql`
      INSERT INTO subscribers (email, type)
      VALUES (${email}, 'subscriber')
      ON CONFLICT (email, type) DO NOTHING
    `;
  } catch (err) {
    console.error('DB insert error', err);
    return json({ error: 'Could not save subscription. Try again.' }, 500);
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

  return json({ ok: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
