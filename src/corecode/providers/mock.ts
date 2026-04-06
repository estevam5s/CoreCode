import type { Message } from '../state.js';

const RESPONSES = [
  'Olá! Sou o CoreCode em modo demo. Configure uma chave de API real para usar um modelo de IA.',
  'Este é o modo mock — útil para testar o fluxo da CLI sem uma chave de API.',
  'Use `/provider groq` e configure `GROQ_API_KEY` para acesso gratuito a modelos Llama, Mixtral e Gemma.',
  'Comandos disponíveis: /model, /provider, /add, /system, /history, /clear, /status, /help.',
  'Dica: obtenha uma chave Groq grátis em https://console.groq.com (sem cartão de crédito).',
];

let counter = 0;

export async function* streamMock(
  messages: Message[],
  _model: string
): AsyncGenerator<string> {
  const lastUser = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  const base = RESPONSES[counter % RESPONSES.length];
  counter++;

  const reply = `[DEMO] ${base}\n\nVocê disse: "${lastUser.slice(0, 60)}${lastUser.length > 60 ? '...' : ''}"`;

  // simulate streaming word by word
  for (const word of reply.split(' ')) {
    yield word + ' ';
    await new Promise((r) => setTimeout(r, 30));
  }
}
