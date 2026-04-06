import { streamOpenAI, listModelsOpenAI } from './openai.js';
import type { Message } from '../state.js';

// Groq is fully OpenAI-compatible — same streaming protocol, different base URL
const GROQ_BASE = 'https://api.groq.com/openai/v1';

export async function* streamGroq(
  messages: Message[],
  model: string
): AsyncGenerator<string> {
  yield* streamOpenAI(messages, model, {
    baseURL: GROQ_BASE,
    apiKey: process.env.GROQ_API_KEY || '',
  });
}

export async function listModelsGroq(): Promise<string[]> {
  return listModelsOpenAI({ baseURL: GROQ_BASE, apiKey: process.env.GROQ_API_KEY });
}
