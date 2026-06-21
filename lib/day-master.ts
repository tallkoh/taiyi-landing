export interface DayMasterInfo {
  stem: string;
  pinyin: string;
  english: string;
  element: string;
  polarity: 'yang' | 'yin';
  image: string;     // short phrase: "a tall tree", "the sun"
  callout: string;   // 1–2 sentence plain-English read
}

export const DAY_MASTERS: Record<string, DayMasterInfo> = {
  '甲': {
    stem: '甲', pinyin: 'jiǎ', english: 'Yang Wood', element: 'Wood', polarity: 'yang',
    image: 'a tall tree',
    callout: 'Structural and upward-moving. Yang wood holds shape under pressure but needs roots in steady ground. The reading favors clear posture over speed.',
  },
  '乙': {
    stem: '乙', pinyin: 'yǐ', english: 'Yin Wood', element: 'Wood', polarity: 'yin',
    image: 'a vine or grass',
    callout: 'Flexible and persistent. Yin wood adapts around obstacles rather than meeting them head-on. The reading favors patient, threading work.',
  },
  '丙': {
    stem: '丙', pinyin: 'bǐng', english: 'Yang Fire', element: 'Fire', polarity: 'yang',
    image: 'the sun',
    callout: 'Visible and outward. Yang fire warms everyone in the room but burns through itself quickly. The reading favors rhythm and rest, not constant output.',
  },
  '丁': {
    stem: '丁', pinyin: 'dīng', english: 'Yin Fire', element: 'Fire', polarity: 'yin',
    image: 'a candle or lamp',
    callout: 'Focused and intimate. Yin fire illuminates one thing at a time and keeps burning longer than yang fire if its fuel is steady. The reading favors close attention to one decision.',
  },
  '戊': {
    stem: '戊', pinyin: 'wù', english: 'Yang Earth', element: 'Earth', polarity: 'yang',
    image: 'a mountain',
    callout: 'Stable and slow to move. Yang earth holds ground for everyone around it and resists being rushed. The reading favors decisions made on your timeline, not someone else\'s.',
  },
  '己': {
    stem: '己', pinyin: 'jǐ', english: 'Yin Earth', element: 'Earth', polarity: 'yin',
    image: 'cultivated soil',
    callout: 'Receptive and nourishing. Yin earth supports growth in others but can lose its own shape if poured into too many forms. The reading favors saying no to one thing.',
  },
  '庚': {
    stem: '庚', pinyin: 'gēng', english: 'Yang Metal', element: 'Metal', polarity: 'yang',
    image: 'unworked iron',
    callout: 'Sharp and direct. Yang metal cuts cleanly but resists being shaped. The reading favors a clear cut over a polished compromise.',
  },
  '辛': {
    stem: '辛', pinyin: 'xīn', english: 'Yin Metal', element: 'Metal', polarity: 'yin',
    image: 'jewelry or a fine blade',
    callout: 'Precise and refined. Yin metal cares about how things are finished, not just whether they are done. The reading favors quality over speed.',
  },
  '壬': {
    stem: '壬', pinyin: 'rén', english: 'Yang Water', element: 'Water', polarity: 'yang',
    image: 'a river or ocean',
    callout: 'Wide-ranging and absorptive. Yang water connects far-apart things and reads people quickly. The reading favors the long view of a relationship or project.',
  },
  '癸': {
    stem: '癸', pinyin: 'guǐ', english: 'Yin Water', element: 'Water', polarity: 'yin',
    image: 'rain or dew',
    callout: 'Quiet and pervasive. Yin water moves through gaps others miss and supports growth without taking credit. The reading favors trusting the slow accumulation.',
  },
};

const SOLAR_TERM_HINTS: Record<string, string> = {
  '芒種': 'Grain in Ear — early summer, the season of ripening fast and outward motion.',
  '夏至': 'Summer Solstice — peak yang, the year\'s longest day.',
  '小暑': 'Slight Heat — the hot stretch begins, work moves indoors.',
  '大暑': 'Great Heat — the year\'s warmest stretch, slow days, careful pacing.',
  '立秋': 'Beginning of Autumn — the energy turns inward even before the weather does.',
  '處暑': 'Limit of Heat — heat releases, the chest opens.',
  '白露': 'White Dew — moisture and clarity return at the same time.',
  '秋分': 'Autumnal Equinox — day and night balance, the chart settles.',
  '寒露': 'Cold Dew — dryness sharpens, attention narrows.',
  '霜降': 'First Frost — finish what was started, store what was gathered.',
  '立冬': 'Beginning of Winter — the year turns to storage and rest.',
  '小雪': 'Slight Snow — quiet enters the season, less output expected.',
  '大雪': 'Great Snow — deep yin, the time for deep work, not visibility.',
  '冬至': 'Winter Solstice — peak yin, the seed of the next year forms.',
  '小寒': 'Slight Cold — coldest stretch begins, conserve resources.',
  '大寒': 'Great Cold — the year\'s coldest, the discipline of stillness.',
  '立春': 'Beginning of Spring — the new bazi year begins, first movement.',
  '雨水': 'Rain Water — moisture returns, decisions soften.',
  '驚蟄': 'Insects Awaken — sudden movement, the world wakes loudly.',
  '春分': 'Spring Equinox — balance returns, planning meets action.',
  '清明': 'Pure Brightness — clarity, ancestral remembering, ceremonies.',
  '穀雨': 'Grain Rain — final planting, the last setting-up before summer.',
  '立夏': 'Beginning of Summer — outward energy rises, the chart opens.',
  '小滿': 'Grain Buds — promise without completion, patience.',
};

export function solarTermDescription(term: string): string {
  return SOLAR_TERM_HINTS[term] ?? `${term} — a transition in the solar calendar.`;
}
