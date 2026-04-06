'use strict';

// ── Model registry for CoreCode VSCode extension ──────────────────────────────

const PROVIDERS = {
  CORECODE: 'CoreCode',
  ANTHROPIC: 'Anthropic',
  OPENAI: 'OpenAI',
  GOOGLE: 'Google',
  GROQ: 'Groq',
  MISTRAL: 'Mistral',
  DEEPSEEK: 'DeepSeek',
  XAI: 'xAI',
  META: 'Meta',
  COHERE: 'Cohere',
  OPENROUTER: 'OpenRouter',
};

/** @type {Array<{id:string, name:string, provider:string, tab:string, free?:boolean, badge?:string}>} */
const ALL_MODELS = [
  // ── CoreCode / Groq (free) ─────────────────────────────────────────────────
  { id: 'groq/llama-3.3-70b-versatile',        name: 'Llama 3.3 70B',              provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.1-8b-instant',           name: 'Llama 3.1 8B Instant',       provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama3-70b-8192',                name: 'Llama 3 70B',                provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/mixtral-8x7b-32768',             name: 'Mixtral 8x7B',               provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/gemma2-9b-it',                   name: 'Gemma 2 9B',                 provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/gemma-7b-it',                    name: 'Gemma 7B',                   provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-guard-3-8b',               name: 'Llama Guard 3 8B',           provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.3-70b-specdec',          name: 'Llama 3.3 70B SpecDec',      provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.2-90b-vision-preview',   name: 'Llama 3.2 90B Vision',       provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.2-11b-vision-preview',   name: 'Llama 3.2 11B Vision',       provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.2-3b-preview',           name: 'Llama 3.2 3B',               provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/llama-3.2-1b-preview',           name: 'Llama 3.2 1B',               provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/deepseek-r1-distill-llama-70b',  name: 'DeepSeek R1 Distill 70B',    provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },
  { id: 'groq/qwen-qwq-32b',                   name: 'Qwen QwQ 32B',               provider: PROVIDERS.GROQ,      tab: 'CoreCode', free: true  },

  // ── Anthropic Claude ──────────────────────────────────────────────────────
  { id: 'claude-opus-4-6',          name: 'Claude Opus 4.6',         provider: PROVIDERS.ANTHROPIC, tab: 'Claude', badge: 'New' },
  { id: 'claude-sonnet-4-6',        name: 'Claude Sonnet 4.6',       provider: PROVIDERS.ANTHROPIC, tab: 'Claude', badge: 'New' },
  { id: 'claude-haiku-4-5',         name: 'Claude Haiku 4.5',        provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-3-5-sonnet-20241022',name: 'Claude 3.5 Sonnet',      provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku',       provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-3-opus-20240229',    name: 'Claude 3 Opus',          provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-3-sonnet-20240229',  name: 'Claude 3 Sonnet',        provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-3-haiku-20240307',   name: 'Claude 3 Haiku',         provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },
  { id: 'claude-2.1',                name: 'Claude 2.1',             provider: PROVIDERS.ANTHROPIC, tab: 'Claude' },

  // ── OpenAI / Codex ────────────────────────────────────────────────────────
  { id: 'gpt-4o',                   name: 'GPT-4o',                  provider: PROVIDERS.OPENAI,    tab: 'OpenAI' },
  { id: 'gpt-4o-mini',              name: 'GPT-4o Mini',             provider: PROVIDERS.OPENAI,    tab: 'OpenAI', free: true },
  { id: 'gpt-4-turbo',              name: 'GPT-4 Turbo',             provider: PROVIDERS.OPENAI,    tab: 'OpenAI' },
  { id: 'gpt-4',                    name: 'GPT-4',                   provider: PROVIDERS.OPENAI,    tab: 'OpenAI' },
  { id: 'gpt-3.5-turbo',            name: 'GPT-3.5 Turbo',           provider: PROVIDERS.OPENAI,    tab: 'OpenAI' },
  { id: 'o1',                       name: 'o1',                      provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'Reasoning' },
  { id: 'o1-mini',                  name: 'o1 Mini',                 provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'Reasoning' },
  { id: 'o3',                       name: 'o3',                      provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'Reasoning' },
  { id: 'o3-mini',                  name: 'o3 Mini',                 provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'Reasoning' },
  { id: 'o4-mini',                  name: 'o4 Mini',                 provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'New' },
  { id: 'gpt-4.1',                  name: 'GPT-4.1',                 provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'New' },
  { id: 'codex-davinci-002',        name: 'Codex Davinci 002',       provider: PROVIDERS.OPENAI,    tab: 'OpenAI' },
  { id: 'gpt-4.1-mini',             name: 'GPT-4.1 Mini',            provider: PROVIDERS.OPENAI,    tab: 'OpenAI', badge: 'New' },

  // ── Google Gemini ─────────────────────────────────────────────────────────
  { id: 'gemini-2.5-pro',            name: 'Gemini 2.5 Pro',         provider: PROVIDERS.GOOGLE,    tab: 'Google', badge: 'New' },
  { id: 'gemini-2.5-flash',          name: 'Gemini 2.5 Flash',       provider: PROVIDERS.GOOGLE,    tab: 'Google', badge: 'New' },
  { id: 'gemini-2.0-flash',          name: 'Gemini 2.0 Flash',       provider: PROVIDERS.GOOGLE,    tab: 'Google' },
  { id: 'gemini-2.0-flash-lite',     name: 'Gemini 2.0 Flash Lite',  provider: PROVIDERS.GOOGLE,    tab: 'Google', free: true },
  { id: 'gemini-1.5-pro',            name: 'Gemini 1.5 Pro',         provider: PROVIDERS.GOOGLE,    tab: 'Google' },
  { id: 'gemini-1.5-flash',          name: 'Gemini 1.5 Flash',       provider: PROVIDERS.GOOGLE,    tab: 'Google' },
  { id: 'gemini-1.5-flash-8b',       name: 'Gemini 1.5 Flash 8B',   provider: PROVIDERS.GOOGLE,    tab: 'Google', free: true },

  // ── xAI Grok ─────────────────────────────────────────────────────────────
  { id: 'grok-3',                   name: 'Grok 3',                  provider: PROVIDERS.XAI,       tab: 'xAI', badge: 'New' },
  { id: 'grok-3-mini',              name: 'Grok 3 Mini',             provider: PROVIDERS.XAI,       tab: 'xAI', badge: 'New' },
  { id: 'grok-2',                   name: 'Grok 2',                  provider: PROVIDERS.XAI,       tab: 'xAI' },
  { id: 'grok-2-mini',              name: 'Grok 2 Mini',             provider: PROVIDERS.XAI,       tab: 'xAI' },
  { id: 'grok-beta',                name: 'Grok Beta',               provider: PROVIDERS.XAI,       tab: 'xAI' },

  // ── DeepSeek ──────────────────────────────────────────────────────────────
  { id: 'deepseek-chat',            name: 'DeepSeek Chat V3',        provider: PROVIDERS.DEEPSEEK,  tab: 'DeepSeek' },
  { id: 'deepseek-reasoner',        name: 'DeepSeek R1',             provider: PROVIDERS.DEEPSEEK,  tab: 'DeepSeek', badge: 'Reasoning' },
  { id: 'deepseek-coder',           name: 'DeepSeek Coder',          provider: PROVIDERS.DEEPSEEK,  tab: 'DeepSeek' },
  { id: 'deepseek-v3',              name: 'DeepSeek V3',             provider: PROVIDERS.DEEPSEEK,  tab: 'DeepSeek' },
  { id: 'deepseek-r1',              name: 'DeepSeek R1 (Latest)',     provider: PROVIDERS.DEEPSEEK,  tab: 'DeepSeek', badge: 'Reasoning' },

  // ── Mistral ───────────────────────────────────────────────────────────────
  { id: 'mistral-large-latest',     name: 'Mistral Large',           provider: PROVIDERS.MISTRAL,   tab: 'Mistral' },
  { id: 'mistral-medium-latest',    name: 'Mistral Medium',          provider: PROVIDERS.MISTRAL,   tab: 'Mistral' },
  { id: 'mistral-small-latest',     name: 'Mistral Small',           provider: PROVIDERS.MISTRAL,   tab: 'Mistral', free: true },
  { id: 'codestral-latest',         name: 'Codestral',               provider: PROVIDERS.MISTRAL,   tab: 'Mistral', badge: 'Code' },
  { id: 'mixtral-8x22b-instruct',   name: 'Mixtral 8x22B',           provider: PROVIDERS.MISTRAL,   tab: 'Mistral' },
  { id: 'open-mixtral-8x7b',        name: 'Mixtral 8x7B',            provider: PROVIDERS.MISTRAL,   tab: 'Mistral', free: true },
  { id: 'open-mistral-7b',          name: 'Mistral 7B',              provider: PROVIDERS.MISTRAL,   tab: 'Mistral', free: true },
  { id: 'mistral-nemo',             name: 'Mistral Nemo',            provider: PROVIDERS.MISTRAL,   tab: 'Mistral', free: true },
  { id: 'pixtral-large-latest',     name: 'Pixtral Large',           provider: PROVIDERS.MISTRAL,   tab: 'Mistral' },

  // ── Meta Llama ────────────────────────────────────────────────────────────
  { id: 'meta-llama/llama-4-maverick',          name: 'Llama 4 Maverick',         provider: PROVIDERS.META, tab: 'OpenRouter', badge: 'New' },
  { id: 'meta-llama/llama-4-scout',             name: 'Llama 4 Scout',            provider: PROVIDERS.META, tab: 'OpenRouter', badge: 'New' },
  { id: 'meta-llama/llama-3.3-70b-instruct',    name: 'Llama 3.3 70B Instruct',   provider: PROVIDERS.META, tab: 'OpenRouter', free: true },
  { id: 'meta-llama/llama-3.1-405b-instruct',   name: 'Llama 3.1 405B',           provider: PROVIDERS.META, tab: 'OpenRouter' },
  { id: 'meta-llama/llama-3.1-70b-instruct',    name: 'Llama 3.1 70B',            provider: PROVIDERS.META, tab: 'OpenRouter', free: true },
  { id: 'meta-llama/llama-3.1-8b-instruct',     name: 'Llama 3.1 8B',             provider: PROVIDERS.META, tab: 'OpenRouter', free: true },
  { id: 'meta-llama/llama-3-70b-instruct',      name: 'Llama 3 70B',              provider: PROVIDERS.META, tab: 'OpenRouter', free: true },

  // ── Cohere ────────────────────────────────────────────────────────────────
  { id: 'command-r-plus',           name: 'Command R+',              provider: PROVIDERS.COHERE,    tab: 'OpenRouter' },
  { id: 'command-r',                name: 'Command R',               provider: PROVIDERS.COHERE,    tab: 'OpenRouter', free: true },
  { id: 'command-a',                name: 'Command A',               provider: PROVIDERS.COHERE,    tab: 'OpenRouter', badge: 'New' },

  // ── OpenRouter exclusives ─────────────────────────────────────────────────
  { id: 'openrouter/auto',                    name: 'Auto Router',                    provider: PROVIDERS.OPENROUTER, tab: 'OpenRouter', free: true },
  { id: 'qwen/qwq-32b',                       name: 'Qwen QwQ 32B',                   provider: 'Qwen',              tab: 'OpenRouter', free: true },
  { id: 'qwen/qwen-2.5-72b-instruct',         name: 'Qwen 2.5 72B',                   provider: 'Qwen',              tab: 'OpenRouter', free: true },
  { id: 'qwen/qwen-2.5-coder-32b-instruct',   name: 'Qwen 2.5 Coder 32B',             provider: 'Qwen',              tab: 'OpenRouter', badge: 'Code' },
  { id: 'microsoft/phi-4',                    name: 'Phi-4',                           provider: 'Microsoft',         tab: 'OpenRouter', free: true },
  { id: 'microsoft/phi-4-multimodal',         name: 'Phi-4 Multimodal',               provider: 'Microsoft',         tab: 'OpenRouter' },
  { id: 'microsoft/phi-3.5-mini-128k',        name: 'Phi-3.5 Mini 128K',              provider: 'Microsoft',         tab: 'OpenRouter', free: true },
  { id: 'nousresearch/nous-hermes-2-mixtral', name: 'Nous Hermes 2 Mixtral',          provider: 'NousResearch',      tab: 'OpenRouter', free: true },
  { id: 'perplexity/sonar-pro',               name: 'Perplexity Sonar Pro',           provider: 'Perplexity',        tab: 'OpenRouter' },
  { id: 'perplexity/sonar',                   name: 'Perplexity Sonar',               provider: 'Perplexity',        tab: 'OpenRouter', free: true },
  { id: 'databricks/dbrx-instruct',           name: 'DBRX Instruct',                  provider: 'Databricks',        tab: 'OpenRouter', free: true },
  { id: 'nvidia/llama-3.1-nemotron-70b',      name: 'Nemotron 70B',                   provider: 'NVIDIA',            tab: 'OpenRouter', free: true },
  { id: 'amazon/nova-pro-v1',                 name: 'Amazon Nova Pro',                provider: 'Amazon',            tab: 'OpenRouter' },
  { id: 'amazon/nova-lite-v1',                name: 'Amazon Nova Lite',               provider: 'Amazon',            tab: 'OpenRouter', free: true },
  { id: 'amazon/nova-micro-v1',               name: 'Amazon Nova Micro',              provider: 'Amazon',            tab: 'OpenRouter', free: true },
  { id: 'ai21/jamba-1-5-large',               name: 'Jamba 1.5 Large',               provider: 'AI21',              tab: 'OpenRouter' },
  { id: 'ai21/jamba-1-5-mini',                name: 'Jamba 1.5 Mini',                provider: 'AI21',              tab: 'OpenRouter', free: true },
  { id: '01-ai/yi-large',                     name: 'Yi Large',                       provider: '01 AI',             tab: 'OpenRouter' },
  { id: 'inflection/inflection-3-pi',         name: 'Inflection Pi',                  provider: 'Inflection',        tab: 'OpenRouter' },
  { id: 'recursal/eagle-7b',                  name: 'EAGLE 7B',                       provider: 'Recursal',          tab: 'OpenRouter', free: true },
  { id: 'sao10k/l3-euryale-70b',              name: 'Euryale 70B',                    provider: 'Sao10k',            tab: 'OpenRouter', free: true },
  { id: 'sophosympatheia/midnight-rose-70b',  name: 'Midnight Rose 70B',              provider: 'Sophosympatheia',   tab: 'OpenRouter' },
  { id: 'cognitivecomputations/dolphin-mixtral', name: 'Dolphin Mixtral',             provider: 'CogComp',           tab: 'OpenRouter', free: true },
  { id: 'teknium/openhermes-2.5-mistral-7b',  name: 'OpenHermes 2.5 Mistral 7B',     provider: 'Teknium',           tab: 'OpenRouter', free: true },
  { id: 'lizpreciatior/lzlv-70b',             name: 'LZLV 70B',                       provider: 'LizPreciatior',     tab: 'OpenRouter', free: true },
  { id: 'gryphe/mythomax-l2-13b',             name: 'MythoMax L2 13B',               provider: 'Gryphe',            tab: 'OpenRouter', free: true },
  { id: 'undi95/toppy-m-7b',                  name: 'Toppy M 7B',                     provider: 'Undi95',            tab: 'OpenRouter', free: true },
  { id: 'openai/gpt-4o',                      name: 'GPT-4o (via OR)',                provider: PROVIDERS.OPENAI,    tab: 'OpenRouter' },
  { id: 'openai/gpt-4o-mini',                 name: 'GPT-4o Mini (via OR)',           provider: PROVIDERS.OPENAI,    tab: 'OpenRouter', free: true },
  { id: 'anthropic/claude-sonnet-4-6',        name: 'Claude Sonnet 4.6 (via OR)',     provider: PROVIDERS.ANTHROPIC, tab: 'OpenRouter' },
  { id: 'anthropic/claude-opus-4-6',          name: 'Claude Opus 4.6 (via OR)',       provider: PROVIDERS.ANTHROPIC, tab: 'OpenRouter' },
  { id: 'google/gemini-2.5-pro',              name: 'Gemini 2.5 Pro (via OR)',        provider: PROVIDERS.GOOGLE,    tab: 'OpenRouter' },
  { id: 'x-ai/grok-3',                        name: 'Grok 3 (via OR)',                provider: PROVIDERS.XAI,       tab: 'OpenRouter' },
  { id: 'deepseek/deepseek-r1',               name: 'DeepSeek R1 (via OR)',           provider: PROVIDERS.DEEPSEEK,  tab: 'OpenRouter', badge: 'Reasoning' },
  { id: 'deepseek/deepseek-chat',             name: 'DeepSeek V3 (via OR)',           provider: PROVIDERS.DEEPSEEK,  tab: 'OpenRouter' },
  { id: 'mistralai/mistral-large',            name: 'Mistral Large (via OR)',         provider: PROVIDERS.MISTRAL,   tab: 'OpenRouter' },
  { id: 'mistralai/codestral-mamba',          name: 'Codestral Mamba',               provider: PROVIDERS.MISTRAL,   tab: 'OpenRouter', badge: 'Code' },
];

const TABS = ['CoreCode', 'Claude', 'OpenAI', 'Google', 'xAI', 'DeepSeek', 'Mistral', 'OpenRouter'];

function getModelsByTab(tab) {
  return ALL_MODELS.filter(m => m.tab === tab);
}

function searchModels(query) {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_MODELS;
  return ALL_MODELS.filter(
    m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q)
  );
}

function getModelById(id) {
  return ALL_MODELS.find(m => m.id === id) || null;
}

module.exports = { ALL_MODELS, TABS, PROVIDERS, getModelsByTab, searchModels, getModelById };
