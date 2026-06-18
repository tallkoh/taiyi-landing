import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { verifyClerkSession } from '../lib/clerk.js';
import { createTransport, FROM } from '../lib/mailer.js';

interface ProfileBody {
  sessionId?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  currentCountry?: string;
  gender?: string;
  tobUnknown?: boolean;
}

const ALLOWED_GENDER = new Set(['m', 'f', 'nb', 'unspecified']);

function bearer(req: VercelRequest): string | undefined {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1];
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const user = await verifyClerkSession(bearer(req));
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = (req.body ?? {}) as ProfileBody;
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  const dob = typeof body.dob === 'string' ? body.dob.trim() : '';
  const tob = body.tobUnknown ? '12:00' : (typeof body.tob === 'string' ? body.tob.trim() : '');
  const pob = typeof body.pob === 'string' ? body.pob.trim() : '';
  const currentCountry = typeof body.currentCountry === 'string'
    ? body.currentCountry.trim().toUpperCase().slice(0, 2)
    : '';
  const gender = typeof body.gender === 'string' ? body.gender.trim().toLowerCase() : '';

  if (!sessionId || !dob || !tob || !pob || !currentCountry || !ALLOWED_GENDER.has(gender)) {
    res.status(400).json({ error: 'Missing or invalid fields' });
    return;
  }

  // Identity check: subscriber row must match BOTH the Stripe session and the Clerk email.
  // This prevents a logged-in Clerk user from claiming someone else's purchase.
  const rows = (await sql`
    SELECT id, email
      FROM subscribers
     WHERE stripe_session_id = ${sessionId}
       AND type = 'subscriber'
     LIMIT 1
  `) as unknown as Array<{ id: number; email: string }>;

  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'No subscription found for that checkout session.' });
    return;
  }

  if (row.email.toLowerCase() !== user.email) {
    res.status(409).json({
      error: 'Your account email must match the email you paid with.',
      paidWith: row.email,
      signedInAs: user.email,
    });
    return;
  }

  await sql`
    UPDATE subscribers
       SET clerk_user_id   = ${user.userId},
           dob             = ${dob},
           tob             = ${tob},
           pob             = ${pob},
           current_country = ${currentCountry},
           gender          = ${gender},
           onboarded_at    = COALESCE(onboarded_at, now())
     WHERE id = ${row.id}
  `;

  try {
    const transport = createTransport();
    await transport.sendMail({
      from: FROM,
      to: row.email,
      subject: 'Welcome to Taiyi 太乙',
      text: `Your account is set up.

Your first letter arrives this Sunday morning. Mid-week (Wednesday) you'll get a short note with three one-tap questions — your answers tune that week's letter. There's nothing to install, nothing to log into.

If anything is wrong, just reply.

— Taiyi 太乙
  Singapore
`,
    });
  } catch (err) {
    console.error('Welcome email send failed', err);
  }

  res.status(200).json({ ok: true });
}
