import Stripe from 'stripe';
import { sql } from '../lib/db.js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  const signature = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe signature verification failed', err);
    return new Response('Bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_details?.email ?? session.customer_email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
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
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
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
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
