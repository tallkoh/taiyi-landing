import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';

interface DeletedRow { email: string }

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const deleted = (await sql`
    DELETE FROM subscribers
     WHERE delete_requested_at IS NOT NULL
       AND delete_requested_at < now() - INTERVAL '7 days'
   RETURNING email
  `) as unknown as DeletedRow[];

  res.status(200).json({ purged: deleted.length });
}
