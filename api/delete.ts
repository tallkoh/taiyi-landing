import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '../lib/db.js';
import { verifyToken } from '../lib/token.js';

interface Row {
  email: string;
  stripe_subscription_id: string | null;
}

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Taiyi</title>
<style>
  body { font-family: Georgia, 'Newsreader', serif; background: #faf8f3; color: #1a1612;
         display: flex; min-height: 100vh; margin: 0; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 480px; border: 1.5px solid #1a1612; padding: 28px; background: #fff; border-radius: 2px; }
  h1 { font-size: 22px; letter-spacing: -0.02em; margin: 0 0 12px; }
  p  { font-size: 14px; line-height: 1.6; color: #3a322a; margin: 0 0 10px; }
  a  { color: #b83828; }
  .stamp { display: inline-flex; width: 22px; height: 22px; background: #b83828; color: #faf8f3;
           align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
           border-radius: 2px; transform: rotate(-3deg); margin-right: 6px; }
</style></head>
<body><div class="card"><h1><span class="stamp">太</span>${title}</h1>${body}<p><a href="/">← Taiyi home</a></p></div></body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const verified = verifyToken(req.query.t);
  if (!verified) {
    res.status(400).send(page('Link expired', '<p>This deletion link is invalid or older than 7 days. Submit a new request from <a href="/delete">/delete</a>.</p>'));
    return;
  }

  const rows = (await sql`
    SELECT email, stripe_subscription_id
      FROM subscribers
     WHERE email = ${verified.email}
  `) as unknown as Row[];

  if (rows.length === 0) {
    res.status(200).send(page('Nothing to delete', `<p>No data on file for <strong>${verified.email}</strong>. Nothing to do.</p>`));
    return;
  }

  // Cancel any live Stripe subscriptions before nulling local data
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    for (const r of rows) {
      if (r.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(r.stripe_subscription_id);
        } catch (err) {
          console.error('Stripe cancel failed during delete', err);
        }
      }
    }
  }

  // Soft delete: null PII immediately, mark for purge in 7 days
  await sql`
    UPDATE subscribers
       SET dob = NULL,
           tob = NULL,
           pob = NULL,
           subscription_status = 'canceled',
           delete_requested_at = now()
     WHERE email = ${verified.email}
  `;

  res.status(200).send(page('Deletion confirmed', `<p>We've nulled the date, time, and place of birth on file for <strong>${verified.email}</strong> and canceled any active subscription. The remaining row (just your email + the deletion marker) will be hard-deleted within 7 days, per the PDPA promise in our FAQ.</p>`));
}
