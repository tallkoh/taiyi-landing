export interface LetterOutput {
  subject: string;
  sections: {
    energy: string;
    focus: string;
    watch: string;
    practice: string;
  };
}

export interface GuardrailResult {
  pass: boolean;
  fails: string[];
}

const FORBIDDEN_TERMS = [
  'diagnose', 'diagnosis', 'cure', 'treatment',
  'guarantee', 'guaranteed', 'guaranteed return',
  'invest in', 'buy stock', 'sell stock',
];

const STOCK_TICKER = /\b[A-Z]{2,5}\b(?=\s*(stock|shares|ticker|\$))/;

const MAX_LETTER_COST_USD_DEFAULT = 0.10;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(s: string): number {
  return s.trim().split(/[.!?]+\s/).filter(x => x.trim().length > 0).length;
}

// Cheap bag-of-words cosine similarity. Not for production search, but
// fine for "did the LLM write nearly the same letter twice in a row".
function bagCosine(a: string, b: string): number {
  const tok = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const counts = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const w of arr) m.set(w, (m.get(w) ?? 0) + 1);
    return m;
  };
  const av = counts(tok(a));
  const bv = counts(tok(b));
  let dot = 0;
  for (const [w, c] of av) dot += c * (bv.get(w) ?? 0);
  const mag = (m: Map<string, number>) => Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0));
  const denom = mag(av) * mag(bv);
  return denom === 0 ? 0 : dot / denom;
}

export interface GuardrailContext {
  output: LetterOutput;
  costUsd: number;
  recentBodies: string[];   // last 2 bodies for repeat-prevention
  weekStartISO: string;     // 'YYYY-MM-DD'
  weekEndISO: string;
}

export function runGuardrails(ctx: GuardrailContext): GuardrailResult {
  const fails: string[] = [];
  const { output, costUsd: cost, recentBodies, weekStartISO, weekEndISO } = ctx;

  const sec = output.sections ?? {} as LetterOutput['sections'];

  // structure
  if (!output.subject || !sec.energy || !sec.focus || !sec.watch || !sec.practice) {
    fails.push('structure');
  }

  const fullBody = [sec.energy, sec.focus, sec.watch, sec.practice].filter(Boolean).join('\n\n');
  const totalWords = wordCount(fullBody);

  if (totalWords < 180 || totalWords > 600) fails.push('word_count');

  for (const [name, text] of Object.entries(sec)) {
    if (!text) continue;
    const sc = sentenceCount(text);
    if (sc < 1 || sc > 4) {
      fails.push(`section_length:${name}`);
      break;
    }
  }

  const lower = fullBody.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) { fails.push('forbidden_terms'); break; }
  }
  if (STOCK_TICKER.test(fullBody)) fails.push('forbidden_terms');

  // hallucinated_date — any 4-digit-year reference outside the current week
  const start = new Date(weekStartISO);
  const end = new Date(weekEndISO);
  const dateMatches = fullBody.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
  for (const d of dateMatches) {
    const dt = new Date(d);
    if (dt < start || dt > end) { fails.push('hallucinated_date'); break; }
  }

  for (const prior of recentBodies) {
    if (bagCosine(fullBody, prior) >= 0.85) { fails.push('repeat_prevention'); break; }
  }

  const ceiling = parseFloat(process.env.MAX_LETTER_COST_USD ?? `${MAX_LETTER_COST_USD_DEFAULT}`);
  if (cost > ceiling) fails.push('cost_ceiling');

  return { pass: fails.length === 0, fails };
}
