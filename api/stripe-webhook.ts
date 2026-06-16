import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { sql } from '../lib/db.js';

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  const signature = (req.headers['stripe-signature'] as string | undefined) ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe signature verification failed', err);
    res.status(400).send('Bad signature');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_details?.email ?? session.customer_email;
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;
        if (email && customerId) {
          await sql`
            INSERT INTO subscribers (email, type, stripe_customer_id, stripe_subscription_id, subscription_status)
            VALUES (${email}, 'subscriber', ${customerId}, ${subscriptionId ?? null}, 'active')
            ON CONFLICT (email, type) DO UPDATE
              SET stripe_customer_id     = EXCLUDED.stripe_customer_id,
                  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                  subscription_status    = 'active'
          `;
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await sql`
          UPDATE subscribers
             SET subscription_status = 'canceled'
           WHERE stripe_subscription_id = ${sub.id}
        `;
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        if (subId) {
          await sql`
            UPDATE subscribers
               SET subscription_status = 'past_due'
             WHERE stripe_subscription_id = ${subId}
          `;
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error', event.type, err);
    res.status(500).send('Handler error');
    return;
  }

  res.status(200).json({ received: true });
}
