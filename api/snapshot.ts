import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';

interface SnapshotBody {
  email?: unknown;
  dob?: unknown;
  tob?: unknown;
  pob?: unknown;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = (req.body ?? {}) as SnapshotBody;
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const dob   = typeof body.dob   === 'string' ? body.dob.trim()   : '';
  const tob   = typeof body.tob   === 'string' ? body.tob.trim()   : '';
  const pob   = typeof body.pob   === 'string' ? body.pob.trim()   : '';

  if (!email || !dob || !tob || !pob) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }

  try {
    await sql`
      INSERT INTO subscribers (email, type, dob, tob, pob)
      VALUES (${email}, 'snapshot', ${dob}, ${tob}, ${pob})
      ON CONFLICT (email, type) DO UPDATE SET dob = ${dob}, tob = ${tob}, pob = ${pob}
    `;
  } catch (err) {
    console.error('DB insert error', err);
    res.status(500).json({ error: 'Could not save request. Try again.' });
    return;
  }

  const transport = createTransport();

  await Promise.all([
    transport.sendMail({
      from: FROM,
      to: process.env.GMAIL_USER,
      subject: `Snapshot request — ${email}`,
      text: `Email: ${email}\nDOB:   ${dob}\nTOB:   ${tob}\nPOB:   ${pob}\nTime:  ${new Date().toISOString()}`,
    }),
    transport.sendMail({
      from: FROM,
      to: email,
      subject: 'Your Taiyi snapshot is queued',
      text: `We've received your birth data and will send your bazi snapshot shortly.\n\nIf anything looks wrong, just reply to this email.\n\n— Taiyi 太乙`,
    }),
  ]).catch(err => console.error('Mail send error', err));

  res.status(200).json({ ok: true });
}
