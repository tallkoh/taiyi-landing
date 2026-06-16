import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';
import { signToken, TTL } from '../lib/token.js';

interface Row { email: string }

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

  const rows = (await sql`
    SELECT email FROM subscribers WHERE email = ${email} LIMIT 1
  `) as unknown as Row[];

  // Always respond ok — never confirm whether an email is in our DB
  // (prevents enumeration). If not on file, just silently no-op.
  if (rows.length === 0) {
    res.status(200).json({ ok: true });
    return;
  }

  const siteUrl = (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
  const confirmUrl = `${siteUrl}/api/delete?t=${signToken(email, TTL.DELETE)}`;

  try {
    const transport = createTransport();
    await transport.sendMail({
      from: FROM,
      to: email,
      subject: 'Confirm deletion of your Taiyi data',
      text: `You (or someone using your email) asked us to delete the data we hold for ${email}.

If this was you, click below to confirm. The link is good for 7 days.

${confirmUrl}

If this was NOT you, ignore this email. Nothing will change.

— Taiyi 太乙`,
    });
    await transport.sendMail({
      from: FROM,
      to: process.env.GMAIL_USER,
      subject: `Delete request — ${email}`,
      text: `Delete confirmation sent to ${email} at ${new Date().toISOString()}`,
    });
  } catch (err) {
    console.error('Delete-request mail failed', err);
    res.status(500).json({ error: 'Could not send confirmation. Try again.' });
    return;
  }

  res.status(200).json({ ok: true });
}
