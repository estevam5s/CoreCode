import type { Message } from '../state.js';

export async function* streamOpenAI(
  messages: Message[],
  model: string,
  opts: { baseURL?: string; apiKey?: string } = {}
): AsyncGenerator<string> {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY || '';
  const baseURL = opts.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.replace(/^data: /, '').trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      try {
        const json = JSON.parse(trimmed);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {}
    }
  }
}

export async function listModelsOpenAI(
  opts: { baseURL?: string; apiKey?: string } = {}
): Promise<string[]> {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY || '';
  const baseURL = opts.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  const res = await fetch(`${baseURL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Failed to list models: ${res.status}`);
  const data = (await res.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id).sort();
}
