import OpenAI from 'openai';

let cached: OpenAI | null = null;

export function openai(): OpenAI {
  if (!cached) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set');
    cached = new OpenAI({ apiKey: key });
  }
  return cached;
}

export function modelName(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-5.4';
}

// Rough $/M-token prices for cost ceiling enforcement. Updated when OpenAI
// publishes official numbers — the env override below lets the user pin
// without a redeploy.
const PRICE_FALLBACK: Record<string, { input: number; output: number }> = {
  'gpt-5.4':       { input: 1.25, output: 10.0 },
  'gpt-5':         { input: 1.25, output: 10.0 },
  'gpt-4o':        { input: 2.50, output: 10.0 },
  'gpt-4o-mini':   { input: 0.15, output: 0.60 },
};

export function priceFor(model: string): { input: number; output: number } {
  const envIn = process.env.OPENAI_PRICE_INPUT_PER_M;
  const envOut = process.env.OPENAI_PRICE_OUTPUT_PER_M;
  if (envIn && envOut) {
    return { input: parseFloat(envIn), output: parseFloat(envOut) };
  }
  return PRICE_FALLBACK[model] ?? PRICE_FALLBACK['gpt-5.4'];
}

export function costUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = priceFor(model);
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}
