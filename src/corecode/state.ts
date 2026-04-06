import { OPENROUTER_MODELS } from './openrouter-models.js';

export type ProviderName = 'openai' | 'gemini' | 'ollama' | 'anthropic' | 'openai-compatible' | 'groq' | 'openrouter' | 'deepseek' | 'mistral' | 'mock';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelEntry {
  provider: ProviderName;
  model: string;
  label?: string;
}

export interface SessionStats {
  messageCount: number;
  estimatedTokens: number;
}

export interface CoreState {
  provider: ProviderName;
  model: string;
  history: Message[];
  customModels: ModelEntry[];
  systemPrompt: string;
  lastResponse: string;
  lastUserMessage: string;
  theme: 'orange' | 'blue' | 'green' | 'purple' | 'white';
  mode: 'code' | 'chat' | 'explain';
  pinnedMessage: string;
  debugMode: boolean;
  startTime: Date;
  sessionStats: SessionStats;
  lastDiff: string;
  diffBackup: Record<string, string>;
  responseLanguage: string;
}

export const BUILTIN_MODELS: Record<ProviderName, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o1-mini', 'o3-mini'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-pro-exp'],
  ollama: ['qwen2.5-coder:7b', 'llama3.2:3b', 'llama3.1:8b', 'mistral:7b', 'deepseek-coder:6.7b'],
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'deepseek-r1-distill-llama-70b'],
  openrouter: OPENROUTER_MODELS,
  deepseek: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'codestral-latest', 'mistral-small-latest'],
  'openai-compatible': [],
  mock: ['mock-demo'],
};

export function createState(): CoreState {
  const provider = (process.env.CORECODE_DEFAULT_PROVIDER as ProviderName) || 'mock';
  const modelDefaults: Record<ProviderName, string> = {
    openai: 'gpt-4o',
    gemini: 'gemini-2.0-flash',
    ollama: 'llama3.2:3b',
    anthropic: 'claude-sonnet-4-6',
    groq: 'llama-3.3-70b-versatile',
    openrouter: 'openai/gpt-4o',
    deepseek: 'deepseek-chat',
    mistral: 'mistral-large-latest',
    'openai-compatible': 'gpt-4o',
    mock: 'mock-demo',
  };
  const model =
    process.env.CORECODE_DEFAULT_MODEL ||
    modelDefaults[provider] ||
    'gpt-4o';

  return {
    provider,
    model,
    history: [],
    customModels: [],
    systemPrompt: 'You are CoreCode, an advanced AI coding assistant. Be concise and precise.',
    lastResponse: '',
    lastUserMessage: '',
    theme: 'orange',
    mode: 'chat',
    pinnedMessage: '',
    debugMode: false,
    startTime: new Date(),
    sessionStats: { messageCount: 0, estimatedTokens: 0 },
    lastDiff: '',
    diffBackup: {},
    responseLanguage: '',
  };
}
