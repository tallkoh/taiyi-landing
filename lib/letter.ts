import type { FourPillars } from './bazi.js';
import { currentSolarTerm } from './bazi.js';

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

// STUB. The real generator will fold in the qimen library + day-master prose;
// the function signature here is the contract that swap will honour.
export function generateLetter(_email: string, bazi: FourPillars): Letter {
  const term = currentSolarTerm();
  const week = weekRangeLabel();
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour]
    .map(p => `${p.stem}${p.branch}`).join(' · ');

  const text = `Dear reader,

Your week of ${week}.

Your four pillars stand at ${pillars}, with ${bazi.dayMaster} as your day master.
The current solar term is ${term}.

[Real prose generation is not yet wired. This is the stub letter. A working
practitioner will review and replace this body before it goes to a paying
subscriber.]

If you wish to stop receiving these letters, simply reply with the word
UNSUBSCRIBE and we will remove you within 24 hours.

— Taiyi 太乙
  Singapore
`;

  return {
    subject: `Taiyi · Your week of ${week}`,
    text,
  };
}
