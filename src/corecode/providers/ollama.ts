import type { Message } from '../state.js';

export async function* streamOllama(
  messages: Message[],
  model: string
): AsyncGenerator<string> {
  const baseURL = process.env.OLLAMA_BASE_URL?.replace('/v1', '') || 'http://localhost:11434';

  const res = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error ${res.status}: ${err}`);
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
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const content = json.message?.content;
        if (content) yield content;
        if (json.done) return;
      } catch {}
    }
  }
}

export async function listModelsOllama(): Promise<string[]> {
  const baseURL = process.env.OLLAMA_BASE_URL?.replace('/v1', '') || 'http://localhost:11434';
  const res = await fetch(`${baseURL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama list error: ${res.status}`);
  const data = (await res.json()) as { models: { name: string }[] };
  return data.models.map((m) => m.name);
}
