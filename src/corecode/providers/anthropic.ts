import type { Message } from '../state.js';

export async function* streamAnthropic(
  messages: Message[],
  model: string
): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const filtered = messages.filter((m) => m.role !== 'system');

  const body: Record<string, unknown> = {
    model,
    max_tokens: 8192,
    messages: filtered,
    stream: true,
  };
  if (systemMsg) body.system = systemMsg;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
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
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        if (json.type === 'content_block_delta') {
          const text = json.delta?.text;
          if (text) yield text;
        }
      } catch {}
    }
  }
}
