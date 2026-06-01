import Stripe from 'stripe';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

  const origin = req.headers.get('origin') ?? process.env.SITE_URL ?? '';

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID ?? '', quantity: 1 }],
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });
  } catch (err) {
    console.error('Stripe session error', err);
    return json({ error: 'Checkout unavailable. Try again shortly.' }, 500);
  }

  return json({ url: session.url });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
