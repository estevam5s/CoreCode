export type CoreProvider =
  | 'openai'
  | 'openai-compatible'
  | 'gemini'
  | 'codex'
  | 'github-models'
  | 'ollama'
  | 'deepseek'
  | 'openrouter'
  | 'custom';

export function resolveDefaultProvider(): CoreProvider {
  const provider =
    process.env.CORECODE_DEFAULT_PROVIDER ||
    (process.env.GEMINI_API_KEY ? 'gemini' : '') ||
    (process.env.OPENAI_API_KEY ? 'openai' : '') ||
    (process.env.OLLAMA_BASE_URL ? 'ollama' : '') ||
    'openai';

  return provider as CoreProvider;
}

export function resolveDefaultModel() {
  return (
    process.env.CORECODE_DEFAULT_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.GEMINI_MODEL ||
    process.env.OLLAMA_MODEL ||
    'gpt-4o'
  );
}
