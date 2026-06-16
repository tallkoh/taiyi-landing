import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';

interface SnapshotBody {
  email?: unknown;
  dob?: unknown;
  tob?: unknown;
  pob?: unknown;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body: SnapshotBody;
  try {
    body = await req.json() as SnapshotBody;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const dob   = typeof body.dob   === 'string' ? body.dob.trim()   : '';
  const tob   = typeof body.tob   === 'string' ? body.tob.trim()   : '';
  const pob   = typeof body.pob   === 'string' ? body.pob.trim()   : '';

  if (!email || !dob || !tob || !pob) return json({ error: 'All fields required' }, 400);

  try {
    await sql`
      INSERT INTO subscribers (email, type, dob, tob, pob)
      VALUES (${email}, 'snapshot', ${dob}, ${tob}, ${pob})
      ON CONFLICT (email, type) DO UPDATE SET dob = ${dob}, tob = ${tob}, pob = ${pob}
    `;
  } catch (err) {
    console.error('DB insert error', err);
    return json({ error: 'Could not save request. Try again.' }, 500);
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

  return json({ ok: true });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
