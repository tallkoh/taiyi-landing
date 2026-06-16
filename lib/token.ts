import { createHmac, timingSafeEqual } from 'node:crypto';

function secret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error('CRON_SECRET not set');
  return s;
}

function hmacHex(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function signToken(email: string, ttlSeconds: number): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${email}|${expires}`;
  const sig = hmacHex(payload);
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

export function verifyToken(token: unknown): { email: string } | null {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const expected = hmacHex(payload);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) return null;

  const sepIdx = payload.lastIndexOf('|');
  if (sepIdx < 0) return null;
  const email = payload.slice(0, sepIdx);
  const expires = parseInt(payload.slice(sepIdx + 1), 10);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  if (!email) return null;

  return { email };
}

export const TTL = {
  UNSUBSCRIBE: 60 * 60 * 24 * 365, // 1 year — old emails should still work
  DELETE:      60 * 60 * 24 * 7,   // 7 days — must act fast
};
