import { Solar } from 'lunar-typescript';

export interface Pillar {
  stem: string;
  branch: string;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;
}

const DOB_SPLIT = /[^\d]+/;

function parseDob(dob: string): { y: number; m: number; d: number } {
  const parts = dob.trim().split(DOB_SPLIT).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) {
    throw new Error(`Unparseable DOB: ${dob}`);
  }
  const [y, m, d] = parts;
  return { y, m, d };
}

function parseTob(tob: string): { h: number; min: number } {
  const lower = tob.trim().toLowerCase();
  const isPm = /pm$/.test(lower);
  const isAm = /am$/.test(lower);
  const digits = lower.replace(/[^\d:]/g, '');
  const [hRaw, minRaw = '0'] = digits.split(':');
  let h = parseInt(hRaw, 10);
  const min = parseInt(minRaw, 10);
  if (Number.isNaN(h) || Number.isNaN(min)) {
    throw new Error(`Unparseable TOB: ${tob}`);
  }
  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;
  return { h, min };
}

// TODO: geocode POB → lat/long → true solar time offset. Civil-time
// approximation is ~80% accurate near the timezone's central meridian.
export function calculateBazi(dob: string, tob: string, _pob: string): FourPillars {
  const { y, m, d } = parseDob(dob);
  const { h, min } = parseTob(tob);
  const solar = Solar.fromYmdHms(y, m, d, h, min, 0);
  const ec = solar.getLunar().getEightChar();
  return {
    year:  { stem: ec.getYearGan(),  branch: ec.getYearZhi()  },
    month: { stem: ec.getMonthGan(), branch: ec.getMonthZhi() },
    day:   { stem: ec.getDayGan(),   branch: ec.getDayZhi()   },
    hour:  { stem: ec.getTimeGan(),  branch: ec.getTimeZhi()  },
    dayMaster: ec.getDayGan(),
  };
}

export function currentSolarTerm(date: Date = new Date()): string {
  const solar = Solar.fromDate(date);
  const prev = solar.getLunar().getPrevJieQi(true);
  return prev.getName();
}
