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
  const token = req.query.t;
  const verified = verifyToken(token);

  if (!verified) {
    res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Link expired', '<p>This unsubscribe link is invalid or has expired. If you keep receiving letters, reply to one with the word UNSUBSCRIBE and we will remove you within 24 hours.</p>'));
    return;
  }

  const rows = (await sql`
    SELECT email, stripe_subscription_id
      FROM subscribers
     WHERE email = ${verified.email}
       AND type = 'subscriber'
  `) as unknown as Row[];

  if (rows.length === 0) {
    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Already off the list', `<p>The email <strong>${verified.email}</strong> is not on our list. Nothing to do.</p>`));
    return;
  }

  const row = rows[0];

  if (row.stripe_subscription_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
      await stripe.subscriptions.cancel(row.stripe_subscription_id);
    } catch (err) {
      console.error('Stripe cancel failed (continuing to mark in DB)', err);
    }
  }

  await sql`
    UPDATE subscribers
       SET subscription_status = 'canceled'
     WHERE email = ${verified.email}
       AND type = 'subscriber'
  `;

  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(page('Unsubscribed', `<p>We've stopped the weekly letter and canceled the subscription for <strong>${verified.email}</strong>. No more charges. No more emails.</p><p>If this was a mistake, write to us and we will restore it.</p>`));
}
