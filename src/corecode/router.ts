import type { CoreState, Message } from './state.js';
import { streamOpenAI } from './providers/openai.js';
import { streamGemini } from './providers/gemini.js';
import { streamOllama } from './providers/ollama.js';
import { streamAnthropic } from './providers/anthropic.js';
import { streamGroq } from './providers/groq.js';
import { streamMock } from './providers/mock.js';
import { streamOpenRouter } from './providers/openrouter.js';
import { streamDeepSeek } from './providers/deepseek.js';
import { streamMistral } from './providers/mistral.js';

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

    case 'groq':
      yield* streamGroq(messages, state.model);
      break;

    case 'mock':
      yield* streamMock(messages, state.model);
      break;

    case 'openrouter':
      yield* streamOpenRouter(messages, state.model);
      break;

    case 'deepseek':
      yield* streamDeepSeek(messages, state.model);
      break;

    case 'mistral':
      yield* streamMistral(messages, state.model);
      break;

    default:
      throw new Error(`Unknown provider: ${state.provider}`);
  }
}
