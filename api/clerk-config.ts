import type { VercelRequest, VercelResponse } from '@vercel/node';

// Publishable keys are public by design — Clerk encodes the Frontend API host
// inside them (base64 between the second underscore and the trailing '$').
// We just hand the value to the browser, which then loads clerk-js from the
// matching CDN host.
function decodeFrontendHost(pk: string): string {
  const segments = pk.split('_');
  const encoded = segments[2] ?? '';
  try {
    return Buffer.from(encoded, 'base64').toString('utf8').replace(/\$$/, '');
  } catch {
    return '';
  }
}

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  const pk = process.env.CLERK_PUBLISHABLE_KEY ?? '';
  if (!pk) {
    res.status(500).json({ error: 'CLERK_PUBLISHABLE_KEY not configured' });
    return;
  }
  const host = decodeFrontendHost(pk);
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({
    publishableKey: pk,
    frontendApiHost: host,
    scriptUrl: host ? `https://${host}/npm/@clerk/clerk-js@5/dist/clerk.browser.js` : '',
  });
}
