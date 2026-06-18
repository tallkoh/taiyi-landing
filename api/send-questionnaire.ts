import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';
import { createTransport, FROM } from '../lib/mailer.js';
import { signPayload, TTL } from '../lib/token.js';

interface ActiveSubscriber {
  id: number;
  email: string;
}

interface Question {
  id: 'energy' | 'focus' | 'weight';
  prompt: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    prompt: 'How is your energy this week?',
    options: [
      { value: 'low',    label: 'Running low' },
      { value: 'steady', label: 'Steady' },
      { value: 'high',   label: 'High' },
    ],
  },
  {
    id: 'focus',
    prompt: 'Where is your attention pointing?',
    options: [
      { value: 'work',          label: 'Work' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'health',        label: 'Health' },
      { value: 'creativity',    label: 'Creativity' },
      { value: 'rest',          label: 'Rest' },
    ],
  },
  {
    id: 'weight',
    prompt: 'What feels heavy right now?',
    options: [
      { value: 'decisions',   label: 'Decisions' },
      { value: 'people',      label: 'People' },
      { value: 'uncertainty', label: 'Uncertainty' },
      { value: 'nothing',     label: 'Nothing in particular' },
    ],
  },
];

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
}

function mondayOfThisWeekISO(now: Date = new Date()): string {
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function questionBlock(sub: ActiveSubscriber, weekStart: string, q: Question): string {
  const lines = q.options.map(opt => {
    const t = signPayload([sub.id, weekStart, q.id, opt.value], TTL.ANSWER);
    const url = `${siteUrl()}/api/answer?t=${t}`;
    return `  • ${opt.label}: ${url}`;
  }).join('\n');
  return `${q.prompt}\n${lines}`;
}

function buildEmail(sub: ActiveSubscriber, weekStart: string): { subject: string; text: string } {
  const blocks = QUESTIONS.map(q => questionBlock(sub, weekStart, q)).join('\n\n');
  return {
    subject: 'A few one-tap questions for Sunday',
    text: `Hi,

Three quick taps. Each answer is a clickable link — pick one per question, your latest tap wins. Your answers tune this Sunday's letter.

${blocks}

If you skip any, that's fine — the letter still arrives Sunday.

— Taiyi 太乙
`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const weekStart = mondayOfThisWeekISO();

  const rows = (await sql`
    SELECT id, email
      FROM subscribers
     WHERE subscription_status = 'active'
       AND type = 'subscriber'
       AND onboarded_at IS NOT NULL
  `) as unknown as ActiveSubscriber[];

  const transport = createTransport();
  let sent = 0;
  let failed = 0;

  for (const sub of rows) {
    try {
      await sql`
        INSERT INTO questionnaire_responses (subscriber_id, week_start)
        VALUES (${sub.id}, ${weekStart})
        ON CONFLICT (subscriber_id, week_start) DO NOTHING
      `;
      const mail = buildEmail(sub, weekStart);
      await transport.sendMail({ from: FROM, to: sub.email, subject: mail.subject, text: mail.text });
      sent++;
    } catch (err) {
      console.error('Questionnaire send failed for', sub.email, err);
      failed++;
    }
  }

  res.status(200).json({ sent, failed, eligible: rows.length, weekStart });
}
