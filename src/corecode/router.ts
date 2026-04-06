import type { CoreState, Message } from './state.js';
import { streamOpenAI } from './providers/openai.js';
import { streamGemini } from './providers/gemini.js';
import { streamOllama } from './providers/ollama.js';
import { streamAnthropic } from './providers/anthropic.js';

export async function* streamResponse(
  state: CoreState,
  userMessage: string
): AsyncGenerator<string> {
  const messages: Message[] = [
    { role: 'system', content: state.systemPrompt },
    ...state.history,
    { role: 'user', content: userMessage },
  ];

  switch (state.provider) {
    case 'openai':
    case 'openai-compatible':
      yield* streamOpenAI(messages, state.model, {
        baseURL: process.env.OPENAI_BASE_URL,
        apiKey: process.env.OPENAI_API_KEY,
      });
      break;

    case 'gemini':
      yield* streamGemini(messages, state.model);
      break;

    case 'ollama':
      yield* streamOllama(messages, state.model);
      break;

    case 'anthropic':
      yield* streamAnthropic(messages, state.model);
      break;

    default:
      throw new Error(`Unknown provider: ${state.provider}`);
  }
}
