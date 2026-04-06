import type { Message } from '../state.js';

export async function* streamMistral(
  messages: Message[],
  model: string,
): AsyncGenerator<string> {
  const apiKey = process.env.MISTRAL_API_KEY || '';
  const baseURL = 'https://api.mistral.ai/v1';

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
    throw new Error(`Mistral API error ${res.status}: ${err}`);
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

export async function listModelsMistral(): Promise<string[]> {
  const apiKey = process.env.MISTRAL_API_KEY || '';
  const baseURL = 'https://api.mistral.ai/v1';

  const res = await fetch(`${baseURL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Failed to list Mistral models: ${res.status}`);
  const data = (await res.json()) as { data: { id: string }[] };
  return data.data.map((m) => m.id).sort();
}
