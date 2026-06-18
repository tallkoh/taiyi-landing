import { NOTES, type Note } from './knowledge/notes.js';
import { DIGEST } from './knowledge/digest.js';

export function corpusDigest(): string {
  return DIGEST;
}

// Day-master stem → element/yin-yang labels teachers actually use in the corpus.
const STEM_TO_LABEL: Record<string, string[]> = {
  '甲': ['yang wood', 'jia', 'wood'],
  '乙': ['yin wood', 'yi', 'wood'],
  '丙': ['yang fire', 'bing', 'fire'],
  '丁': ['yin fire', 'ding', 'fire'],
  '戊': ['yang earth', 'wu', 'earth'],
  '己': ['yin earth', 'ji', 'earth'],
  '庚': ['yang metal', 'geng', 'metal'],
  '辛': ['yin metal', 'xin', 'metal'],
  '壬': ['yang water', 'ren', 'water'],
  '癸': ['yin water', 'gui', 'water'],
};

const PULSE_TO_KEYWORDS: Record<string, string[]> = {
  low:        ['rest', 'recovery', 'depletion', 'protection'],
  steady:     ['stability', 'maintenance', 'discipline'],
  high:       ['action', 'momentum', 'manifesting', 'wealth'],
  work:           ['career', 'wealth', 'business', 'output'],
  relationships:  ['relationship', 'synastry', 'people', 'partnership'],
  health:         ['health', 'wellness', 'vitality', 'healing'],
  creativity:     ['creative', 'expression', 'manifesting'],
  rest:           ['rest', 'rejuvenation', 'protection', 'recovery'],
  decisions:     ['decision', 'date selection', 'auspicious', 'timing'],
  people:        ['relationship', 'people', 'synastry'],
  uncertainty:   ['forecast', 'protection', 'guidance'],
  nothing:       ['general', 'overview'],
};

export interface RetrieveInput {
  dayMasterStem?: string;
  solarTerm?: string;
  energy?: string;
  focus?: string;
  weight?: string;
}

export interface RetrievedNote {
  source: string;
  content: string;
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
}

function buildQueryTerms(input: RetrieveInput): string[] {
  const terms: string[] = [];
  if (input.dayMasterStem && STEM_TO_LABEL[input.dayMasterStem]) {
    terms.push(...STEM_TO_LABEL[input.dayMasterStem]);
  }
  if (input.solarTerm) terms.push(...tokenize(input.solarTerm));
  for (const key of ['energy', 'focus', 'weight'] as const) {
    const v = input[key];
    if (v && PULSE_TO_KEYWORDS[v]) terms.push(...PULSE_TO_KEYWORDS[v]);
  }
  return Array.from(new Set(terms));
}

// Score each note by # of query terms appearing in content+source; tie-break
// by content length. Linear scan over ~150 entries — no embeddings needed.
export function retrieve(input: RetrieveInput, n = 5): RetrievedNote[] {
  const terms = buildQueryTerms(input);
  if (terms.length === 0) return [];

  const scored: { note: Note; score: number }[] = [];
  for (const note of NOTES) {
    const haystack = (note.content + ' ' + note.source).toLowerCase();
    let score = 0;
    for (const t of terms) if (haystack.includes(t)) score++;
    if (score > 0) scored.push({ note, score });
  }

  scored.sort((a, b) => (b.score - a.score) || (b.note.content.length - a.note.content.length));

  return scored.slice(0, n).map(x => ({
    source: x.note.source,
    content: x.note.content,
  }));
}
