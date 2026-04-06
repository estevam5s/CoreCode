export type ProviderName = 'openai' | 'gemini' | 'ollama' | 'anthropic' | 'openai-compatible';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelEntry {
  provider: ProviderName;
  model: string;
  label?: string;
}

export interface CoreState {
  provider: ProviderName;
  model: string;
  history: Message[];
  customModels: ModelEntry[];
  systemPrompt: string;
}

export const BUILTIN_MODELS: Record<ProviderName, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o1-mini', 'o3-mini'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-pro-exp'],
  ollama: ['qwen2.5-coder:7b', 'llama3.2:3b', 'llama3.1:8b', 'mistral:7b', 'deepseek-coder:6.7b'],
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  'openai-compatible': [],
};

export function createState(): CoreState {
  const provider = (process.env.CORECODE_DEFAULT_PROVIDER as ProviderName) || 'openai';
  const model =
    process.env.CORECODE_DEFAULT_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.GEMINI_MODEL ||
    process.env.OLLAMA_MODEL ||
    'gpt-4o';

  return {
    provider,
    model,
    history: [],
    customModels: [],
    systemPrompt: 'You are CoreCode, an advanced AI coding assistant. Be concise and precise.',
  };
}
