import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  const origin = (req.headers.origin as string | undefined) ?? process.env.SITE_URL ?? '';

  try {
    const firstMonthCouponId = process.env.STRIPE_FIRST_MONTH_COUPON_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID ?? '', quantity: 1 }],
      success_url: `${origin}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}#pricing`,
      billing_address_collection: 'auto',
      ...(firstMonthCouponId
        ? { discounts: [{ coupon: firstMonthCouponId }] }
        : { allow_promotion_codes: true }),
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error', err);
    res.status(500).json({ error: 'Checkout unavailable. Try again shortly.' });
  }
}
