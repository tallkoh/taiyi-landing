import type { FourPillars } from './bazi.js';
import { currentSolarTerm } from './bazi.js';
import { signToken, TTL } from './token.js';

export interface Letter {
  subject: string;
  text: string;
}

function weekRangeLabel(now: Date = new Date()): string {
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', timeZone: 'UTC',
  });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function siteUrl(): string {
  return (process.env.SITE_URL ?? 'https://taiyi.guru').replace(/\/$/, '');
}

// STUB. The real generator will fold in the qimen library + day-master prose;
// the function signature here is the contract that swap will honour.
export function generateLetter(email: string, bazi: FourPillars): Letter {
  const term = currentSolarTerm();
  const week = weekRangeLabel();
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]
    .map(p => `${p.stem}${p.branch}`).join(' · ');
  const unsubUrl = `${siteUrl()}/api/unsubscribe?t=${signToken(email, TTL.UNSUBSCRIBE)}`;

  const text = `Dear reader,

Your week of ${week}.

Your four pillars stand at ${pillars}, with ${bazi.dayMaster} as your day master.
The current solar term is ${term}.

[Real prose generation is not yet wired. This is the stub letter. A working
practitioner will review and replace this body before it goes to a paying
subscriber.]

— Taiyi 太乙
  Singapore

────────────────────────────────────────────
To stop receiving these letters and cancel your subscription, click:
${unsubUrl}

To request deletion of your data (PDPA), visit ${siteUrl()}/delete
`;

  return {
    subject: `Taiyi · Your week of ${week}`,
    text,
  };
}
