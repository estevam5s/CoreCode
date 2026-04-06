import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';
import type { ProviderName } from './state.js';

// ─── Colors ───────────────────────────────────────────────────────────────────
const ORANGE  = chalk.hex('#E8955A');
const DIM     = chalk.dim;
const WHITE   = chalk.white;
const GREEN   = chalk.hex('#22c55e');
const BOLD    = chalk.bold;

// ─── ASCII art mascot (pixel robot) ───────────────────────────────────────────
const MASCOT_LINES = [
  `        ${DIM('*')}           ${DIM('*')}      `,
  `  ${DIM('*')}   ${ORANGE('┌─────┐')}              `,
  `       ${ORANGE('│ ◉ ◉ │')}   ${DIM('*')}          `,
  `  ${DIM('*')}   ${ORANGE('│  ▽  │')}              `,
  `       ${ORANGE('└──┬──┘')}     ${DIM('*')}        `,
  `   ${DIM('*')}   ${ORANGE('┌──┴──┐')}              `,
  `       ${ORANGE('│     │')}              `,
  `       ${ORANGE('└─┘ └─┘')}   ${DIM('*')}         `,
];

const STARS_FRAME_A = [
  `  ${DIM('*')}                    ${DIM('*')}   `,
  `                  ${DIM('.')}        `,
  `         ${DIM('.')}                 `,
  `  ${DIM('.')}              ${DIM('*')}          `,
];

function printMascot() {
  console.log('');
  STARS_FRAME_A.slice(0, 2).forEach(l => console.log(l));
  MASCOT_LINES.forEach(l => console.log(l));
  STARS_FRAME_A.slice(2).forEach(l => console.log(l));
  console.log('');
}

// ─── Terminal helpers ─────────────────────────────────────────────────────────
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_LINE  = '\x1b[2K\r';

function clearLines(n: number) {
  for (let i = 0; i < n; i++) process.stdout.write('\x1b[1A\x1b[2K');
}

// ─── Interactive arrow-key menu ───────────────────────────────────────────────
interface MenuItem {
  label: string;
  hint?: string;
  value: string;
}

async function selectMenu(
  items: MenuItem[],
  selectedInit = 0,
): Promise<string> {
  return new Promise((resolve) => {
    let sel = Math.max(0, Math.min(selectedInit, items.length - 1));

    const render = () => {
      process.stdout.write(HIDE_CURSOR);
      items.forEach((item, i) => {
        const arrow  = i === sel ? ORANGE('> ') : '  ';
        const num    = DIM(`${i + 1}. `);
        const label  = i === sel ? WHITE(item.label) : DIM(item.label);
        const hint   = item.hint ? DIM(' · ' + item.hint) : '';
        process.stdout.write(`${CLEAR_LINE}${arrow}${num}${label}${hint}\n`);
      });
    };

    const lineCount = items.length;
    render();

    const onKey = (raw: string) => {
      const UP    = '\x1b[A';
      const DOWN  = '\x1b[B';
      const ENTER = '\r';
      const LF    = '\n';

      if (raw === UP)    { sel = (sel - 1 + items.length) % items.length; }
      if (raw === DOWN)  { sel = (sel + 1) % items.length; }
      if (raw >= '1' && raw <= '9') {
        const n = parseInt(raw) - 1;
        if (n >= 0 && n < items.length) {
          sel = n;
          cleanup();
          resolve(items[sel].value);
          return;
        }
      }
      if (raw === ENTER || raw === LF) {
        cleanup();
        resolve(items[sel].value);
        return;
      }

      clearLines(lineCount);
      render();
    };

    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener('data', onKey);
      process.stdin.pause();
      process.stdout.write(SHOW_CURSOR);
      clearLines(lineCount);
    };

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', onKey);
    } else {
      // Non-interactive fallback: readline
      cleanup();
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(WHITE('Choice (number): '), (ans) => {
        rl.close();
        const n = parseInt(ans.trim()) - 1;
        resolve(items[n >= 0 && n < items.length ? n : 0].value);
      });
    }
  });
}

async function askInput(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function divider() {
  const w = Math.min(process.stdout.columns || 72, 72);
  console.log(DIM('─'.repeat(w)));
}

// ─── SCREEN 1: Theme selection ────────────────────────────────────────────────
const THEMES: MenuItem[] = [
  { label: 'Dark mode',                    hint: '✓ recommended',       value: 'dark' },
  { label: 'Light mode',                   hint: '',                    value: 'light' },
  { label: 'Dark mode (colorblind-friendly)',  hint: '',                value: 'dark-cb' },
  { label: 'Light mode (colorblind-friendly)', hint: '',                value: 'light-cb' },
  { label: 'Dark mode (ANSI colors only)', hint: '',                    value: 'dark-ansi' },
  { label: 'Light mode (ANSI colors only)', hint: '',                   value: 'light-ansi' },
];

async function selectTheme(): Promise<string> {
  printMascot();
  console.log(WHITE("Let's get started.\n"));
  console.log(WHITE('Choose the text style that looks best with your terminal'));
  console.log(DIM('To change this later, run /theme\n'));
  divider();
  console.log('');

  const theme = await selectMenu(THEMES, 0);

  console.log('');
  divider();
  console.log('');
  return theme;
}

// ─── SCREEN 2: Provider selection ─────────────────────────────────────────────
const PROVIDERS_MENU: MenuItem[] = [
  {
    label: 'Groq',
    hint:  'Free · llama-3.3-70b, mixtral, gemma2',
    value: 'groq',
  },
  {
    label: 'OpenRouter',
    hint:  '200+ models · GPT-4o, Claude, DeepSeek, Gemini, Grok...',
    value: 'openrouter',
  },
  {
    label: 'OpenAI',
    hint:  'GPT-4o, o3-mini, gpt-4-turbo',
    value: 'openai',
  },
  {
    label: 'Anthropic',
    hint:  'Claude Sonnet, Opus, Haiku',
    value: 'anthropic',
  },
  {
    label: 'Google Gemini',
    hint:  'Gemini 2.0 Flash, 1.5 Pro',
    value: 'gemini',
  },
  {
    label: 'DeepSeek',
    hint:  'deepseek-chat, deepseek-r1, deepseek-coder',
    value: 'deepseek',
  },
  {
    label: 'Mistral',
    hint:  'mistral-large, codestral, mistral-small',
    value: 'mistral',
  },
  {
    label: 'Ollama (local)',
    hint:  '100% offline · No API key needed',
    value: 'ollama',
  },
  {
    label: 'OpenAI-Compatible',
    hint:  'vLLM, LM Studio, any custom endpoint',
    value: 'openai-compatible',
  },
];

async function selectProvider(): Promise<string> {
  printMascot();
  console.log(WHITE('CoreCode works with any AI provider using your own API keys.\n'));
  console.log(WHITE('Select provider:'));
  console.log(DIM('Use ↑↓ arrows or type a number, then Enter\n'));
  divider();
  console.log('');

  const provider = await selectMenu(PROVIDERS_MENU, 0);

  console.log('');
  divider();
  console.log('');
  return provider;
}

// ─── OpenRouter models ────────────────────────────────────────────────────────
const OPENROUTER_MODELS: MenuItem[] = [
  // OpenAI
  { label: 'openai/gpt-4o',                 hint: 'OpenAI · Best quality',           value: 'openai/gpt-4o' },
  { label: 'openai/gpt-4o-mini',             hint: 'OpenAI · Fast & affordable',      value: 'openai/gpt-4o-mini' },
  { label: 'openai/o3-mini',                 hint: 'OpenAI · Reasoning model',        value: 'openai/o3-mini' },
  { label: 'openai/o1',                      hint: 'OpenAI · Advanced reasoning',     value: 'openai/o1' },
  { label: 'openai/gpt-4-turbo',             hint: 'OpenAI · 128k context',           value: 'openai/gpt-4-turbo' },
  // Anthropic
  { label: 'anthropic/claude-sonnet-4-5',    hint: 'Anthropic · Top coding model',    value: 'anthropic/claude-sonnet-4-5' },
  { label: 'anthropic/claude-opus-4',        hint: 'Anthropic · Most capable',        value: 'anthropic/claude-opus-4' },
  { label: 'anthropic/claude-haiku-3-5',     hint: 'Anthropic · Fastest Claude',      value: 'anthropic/claude-haiku-3-5' },
  // Google
  { label: 'google/gemini-2.0-flash-exp',    hint: 'Google · Fast & free tier',       value: 'google/gemini-2.0-flash-exp' },
  { label: 'google/gemini-1.5-pro',          hint: 'Google · 2M token context',       value: 'google/gemini-1.5-pro' },
  { label: 'google/gemini-1.5-flash',        hint: 'Google · Speed optimized',        value: 'google/gemini-1.5-flash' },
  // Meta / Llama
  { label: 'meta-llama/llama-3.3-70b-instruct', hint: 'Meta · Best open LLM',        value: 'meta-llama/llama-3.3-70b-instruct' },
  { label: 'meta-llama/llama-3.1-405b-instruct',hint: 'Meta · Largest Llama',        value: 'meta-llama/llama-3.1-405b-instruct' },
  { label: 'meta-llama/llama-3.1-8b-instruct',  hint: 'Meta · Lightweight & fast',   value: 'meta-llama/llama-3.1-8b-instruct' },
  { label: 'meta-llama/llama-3.2-3b-instruct',  hint: 'Meta · Ultra fast / edge',    value: 'meta-llama/llama-3.2-3b-instruct' },
  // DeepSeek
  { label: 'deepseek/deepseek-chat',         hint: 'DeepSeek · General purpose',      value: 'deepseek/deepseek-chat' },
  { label: 'deepseek/deepseek-r1',           hint: 'DeepSeek · Reasoning',            value: 'deepseek/deepseek-r1' },
  { label: 'deepseek/deepseek-r1-distill-llama-70b', hint: 'DeepSeek · R1 distilled', value: 'deepseek/deepseek-r1-distill-llama-70b' },
  { label: 'deepseek/deepseek-coder-v2',     hint: 'DeepSeek · Code specialist',      value: 'deepseek/deepseek-coder-v2' },
  // Mistral
  { label: 'mistralai/mistral-large-2411',   hint: 'Mistral · Flagship model',        value: 'mistralai/mistral-large-2411' },
  { label: 'mistralai/codestral-2501',        hint: 'Mistral · Code specialist',      value: 'mistralai/codestral-2501' },
  { label: 'mistralai/mistral-medium',        hint: 'Mistral · Balanced',             value: 'mistralai/mistral-medium' },
  { label: 'mistralai/mistral-7b-instruct',   hint: 'Mistral · Lightweight',          value: 'mistralai/mistral-7b-instruct' },
  // Qwen (Alibaba)
  { label: 'qwen/qwen-2.5-72b-instruct',     hint: 'Alibaba · Top open model',        value: 'qwen/qwen-2.5-72b-instruct' },
  { label: 'qwen/qwen-2.5-coder-32b-instruct',hint: 'Alibaba · Code specialist',     value: 'qwen/qwen-2.5-coder-32b-instruct' },
  { label: 'qwen/qwq-32b-preview',           hint: 'Alibaba · Reasoning model',       value: 'qwen/qwq-32b-preview' },
  // xAI
  { label: 'x-ai/grok-2-1212',              hint: 'xAI · Grok flagship',              value: 'x-ai/grok-2-1212' },
  { label: 'x-ai/grok-beta',                hint: 'xAI · Grok beta',                  value: 'x-ai/grok-beta' },
  // Cohere
  { label: 'cohere/command-r-plus',          hint: 'Cohere · Best Command model',      value: 'cohere/command-r-plus' },
  { label: 'cohere/command-r',               hint: 'Cohere · Fast & capable',          value: 'cohere/command-r' },
  // Perplexity
  { label: 'perplexity/sonar-pro',           hint: 'Perplexity · Online search',       value: 'perplexity/sonar-pro' },
  { label: 'perplexity/sonar',               hint: 'Perplexity · Lightweight',         value: 'perplexity/sonar' },
  // MiniMax
  { label: 'minimax/minimax-01',             hint: 'MiniMax · Long context (1M)',       value: 'minimax/minimax-01' },
  // Microsoft
  { label: 'microsoft/phi-4',               hint: 'Microsoft · Small but powerful',    value: 'microsoft/phi-4' },
  { label: 'microsoft/phi-3.5-mini-128k-instruct', hint: 'Microsoft · Ultra compact', value: 'microsoft/phi-3.5-mini-128k-instruct' },
  // Amazon
  { label: 'amazon/nova-pro-v1',            hint: 'Amazon · Nova flagship',             value: 'amazon/nova-pro-v1' },
  // NousResearch
  { label: 'nousresearch/hermes-3-llama-3.1-405b', hint: 'Nous · Fine-tuned Llama',   value: 'nousresearch/hermes-3-llama-3.1-405b' },
  // 01.ai
  { label: '01-ai/yi-large',                hint: '01.ai · Yi flagship',               value: '01-ai/yi-large' },
];

async function selectOpenRouterModel(): Promise<string> {
  console.log(WHITE('Select model from OpenRouter:'));
  console.log(DIM('200+ models available · showing popular options\n'));
  divider();
  console.log('');

  const model = await selectMenu(OPENROUTER_MODELS, 0);

  console.log('');
  divider();
  console.log('');
  return model;
}

// ─── Provider config map ───────────────────────────────────────────────────────
const PROVIDER_CONFIG: Record<string, {
  envKey: string;
  label: string;
  url: string;
  baseUrl?: string;
  needsKey: boolean;
  defaultModel: string;
}> = {
  groq: {
    envKey: 'GROQ_API_KEY',
    label: 'Groq API Key',
    url: 'https://console.groq.com',
    needsKey: true,
    defaultModel: 'llama-3.3-70b-versatile',
  },
  openrouter: {
    envKey: 'OPENROUTER_API_KEY',
    label: 'OpenRouter API Key',
    url: 'https://openrouter.ai/keys',
    baseUrl: 'https://openrouter.ai/api/v1',
    needsKey: true,
    defaultModel: 'openai/gpt-4o',
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    label: 'OpenAI API Key',
    url: 'https://platform.openai.com/api-keys',
    needsKey: true,
    defaultModel: 'gpt-4o',
  },
  anthropic: {
    envKey: 'ANTHROPIC_API_KEY',
    label: 'Anthropic API Key',
    url: 'https://console.anthropic.com/settings/keys',
    needsKey: true,
    defaultModel: 'claude-sonnet-4-6',
  },
  gemini: {
    envKey: 'GEMINI_API_KEY',
    label: 'Google Gemini API Key',
    url: 'https://aistudio.google.com/app/apikey',
    needsKey: true,
    defaultModel: 'gemini-2.0-flash',
  },
  deepseek: {
    envKey: 'DEEPSEEK_API_KEY',
    label: 'DeepSeek API Key',
    url: 'https://platform.deepseek.com/api_keys',
    baseUrl: 'https://api.deepseek.com/v1',
    needsKey: true,
    defaultModel: 'deepseek-chat',
  },
  mistral: {
    envKey: 'MISTRAL_API_KEY',
    label: 'Mistral API Key',
    url: 'https://console.mistral.ai/api-keys',
    baseUrl: 'https://api.mistral.ai/v1',
    needsKey: true,
    defaultModel: 'mistral-large-latest',
  },
  ollama: {
    envKey: '',
    label: 'Ollama (no key needed)',
    url: 'https://ollama.ai',
    needsKey: false,
    defaultModel: 'llama3.2',
  },
  'openai-compatible': {
    envKey: 'OPENAI_API_KEY',
    label: 'API Key',
    url: '',
    needsKey: true,
    defaultModel: 'gpt-4o',
  },
};

// ─── hasAnyKey ────────────────────────────────────────────────────────────────
export function hasAnyKey(): boolean {
  return !!(
    process.env.GROQ_API_KEY         ||
    process.env.OPENAI_API_KEY        ||
    process.env.GEMINI_API_KEY        ||
    process.env.ANTHROPIC_API_KEY     ||
    process.env.OPENROUTER_API_KEY    ||
    process.env.DEEPSEEK_API_KEY      ||
    process.env.MISTRAL_API_KEY       ||
    process.env.OLLAMA_BASE_URL
  );
}

export function getMissingKeyMessage(provider: ProviderName): string {
  const cfg = PROVIDER_CONFIG[provider];
  if (!cfg) return chalk.gray('Run /provider to switch providers.');
  if (!cfg.needsKey) {
    return chalk.gray(
      `Ollama não está acessível em ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}.\n` +
      `Instale em https://ollama.ai e execute: ollama serve`
    );
  }
  return (
    WHITE(`Missing key: `) + BOLD(cfg.envKey) + '\n' +
    DIM(`Get it at: ${cfg.url}`) + '\n' +
    DIM(`Then add to .env: ${cfg.envKey}=...`) + '\n' +
    DIM(`Or switch provider: /provider groq`)
  );
}

// ─── Write to .env ────────────────────────────────────────────────────────────
function writeEnv(envPath: string, vars: Record<string, string>) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  for (const [key, val] of Object.entries(vars)) {
    if (!val) continue;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content = content.trimEnd() + `\n${key}=${val}\n`;
    }
    process.env[key] = val;
  }
  fs.writeFileSync(envPath, content);
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
export async function runSetupWizard(envPath: string): Promise<void> {
  // ── Screen 1: Theme ──────────────────────────────────────────────────────────
  const theme = await selectTheme();

  console.log(`  ${GREEN('✓')} ${DIM('Theme set to:')} ${WHITE(theme)}`);
  console.log('');

  // ── Screen 2: Provider ───────────────────────────────────────────────────────
  const providerRaw = await selectProvider();
  const provider    = providerRaw as ProviderName;
  const cfg         = PROVIDER_CONFIG[providerRaw] ?? PROVIDER_CONFIG.groq;

  console.log(`  ${GREEN('✓')} ${DIM('Provider:')} ${ORANGE(providerRaw)}\n`);

  const envVars: Record<string, string> = {};

  // ── API key ──────────────────────────────────────────────────────────────────
  let apiKey = '';
  if (provider === 'ollama') {
    console.log(DIM('  Ollama uses a local server — no API key needed.'));
    console.log(DIM('  Make sure `ollama serve` is running, then install a model:'));
    console.log(ORANGE('  $ ollama pull llama3.2\n'));
    envVars['OLLAMA_BASE_URL'] = 'http://localhost:11434';
  } else if (provider === 'openai-compatible') {
    console.log(WHITE('  Enter your custom endpoint base URL:'));
    const baseUrl = await askInput(ORANGE('  Base URL: '));
    if (baseUrl) envVars['OPENAI_BASE_URL'] = baseUrl;
    console.log('');
    console.log(DIM(`  Get your API key from the provider's console.`));
    apiKey = await askInput(ORANGE('  API Key: '));
    if (apiKey) envVars['OPENAI_API_KEY'] = apiKey;
  } else {
    console.log(DIM(`  Get your key at: `) + ORANGE(cfg.url));
    apiKey = await askInput(ORANGE(`  ${cfg.label}: `));
    apiKey = apiKey.trim();
    if (apiKey && cfg.envKey) envVars[cfg.envKey] = apiKey;

    // For providers that use openai-compatible base URL internally
    if (cfg.baseUrl) {
      envVars['OPENAI_BASE_URL'] = cfg.baseUrl;
      // Map openrouter/deepseek/mistral key to OPENAI_API_KEY for repl.ts compatibility
      if (provider === 'openrouter' || provider === 'deepseek' || provider === 'mistral') {
        envVars['OPENAI_API_KEY'] = apiKey;
      }
    }
  }

  console.log('');

  // ── Model selection ──────────────────────────────────────────────────────────
  let model = cfg.defaultModel;

  if (provider === 'openrouter') {
    model = await selectOpenRouterModel();
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'groq') {
    const groqModels: MenuItem[] = [
      { label: 'llama-3.3-70b-versatile',       hint: 'Best quality',         value: 'llama-3.3-70b-versatile' },
      { label: 'llama-3.1-8b-instant',           hint: 'Fastest',              value: 'llama-3.1-8b-instant' },
      { label: 'mixtral-8x7b-32768',             hint: '32k context',          value: 'mixtral-8x7b-32768' },
      { label: 'gemma2-9b-it',                   hint: "Google's Gemma 2",     value: 'gemma2-9b-it' },
      { label: 'deepseek-r1-distill-llama-70b',  hint: 'Reasoning via Groq',   value: 'deepseek-r1-distill-llama-70b' },
    ];
    console.log(WHITE('Select Groq model:\n'));
    model = await selectMenu(groqModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'openai') {
    const openaiModels: MenuItem[] = [
      { label: 'gpt-4o',       hint: 'Best quality',          value: 'gpt-4o' },
      { label: 'gpt-4o-mini',  hint: 'Fast & affordable',     value: 'gpt-4o-mini' },
      { label: 'o3-mini',      hint: 'Reasoning model',       value: 'o3-mini' },
      { label: 'o1',           hint: 'Advanced reasoning',    value: 'o1' },
      { label: 'gpt-4-turbo',  hint: '128k context',          value: 'gpt-4-turbo' },
    ];
    console.log(WHITE('Select OpenAI model:\n'));
    model = await selectMenu(openaiModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'anthropic') {
    const anthropicModels: MenuItem[] = [
      { label: 'claude-sonnet-4-6',        hint: 'Best coding model',  value: 'claude-sonnet-4-6' },
      { label: 'claude-opus-4-6',          hint: 'Most capable',       value: 'claude-opus-4-6' },
      { label: 'claude-haiku-4-5-20251001',hint: 'Fastest Claude',     value: 'claude-haiku-4-5-20251001' },
    ];
    console.log(WHITE('Select Anthropic model:\n'));
    model = await selectMenu(anthropicModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'gemini') {
    const geminiModels: MenuItem[] = [
      { label: 'gemini-2.0-flash',      hint: 'Fastest, free tier',    value: 'gemini-2.0-flash' },
      { label: 'gemini-1.5-pro',        hint: '2M token context',      value: 'gemini-1.5-pro' },
      { label: 'gemini-1.5-flash',      hint: 'Speed optimized',       value: 'gemini-1.5-flash' },
      { label: 'gemini-2.0-pro-exp',    hint: 'Experimental flagship', value: 'gemini-2.0-pro-exp' },
    ];
    console.log(WHITE('Select Gemini model:\n'));
    model = await selectMenu(geminiModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'deepseek') {
    const dsModels: MenuItem[] = [
      { label: 'deepseek-chat',      hint: 'General purpose',   value: 'deepseek-chat' },
      { label: 'deepseek-reasoner',  hint: 'Chain-of-thought',  value: 'deepseek-reasoner' },
      { label: 'deepseek-coder',     hint: 'Code specialist',   value: 'deepseek-coder' },
    ];
    console.log(WHITE('Select DeepSeek model:\n'));
    model = await selectMenu(dsModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'mistral') {
    const mistralModels: MenuItem[] = [
      { label: 'mistral-large-latest',  hint: 'Flagship',           value: 'mistral-large-latest' },
      { label: 'codestral-latest',      hint: 'Code specialist',    value: 'codestral-latest' },
      { label: 'mistral-medium-latest', hint: 'Balanced',           value: 'mistral-medium-latest' },
      { label: 'mistral-small-latest',  hint: 'Fast & affordable',  value: 'mistral-small-latest' },
    ];
    console.log(WHITE('Select Mistral model:\n'));
    model = await selectMenu(mistralModels, 0);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  } else if (provider === 'ollama') {
    const ollamaModels: MenuItem[] = [
      { label: 'llama3.2',          hint: 'Fast on Apple Silicon', value: 'llama3.2' },
      { label: 'qwen2.5-coder:7b',  hint: 'Best local code model', value: 'qwen2.5-coder:7b' },
      { label: 'llama3.1:8b',       hint: 'Balanced',              value: 'llama3.1:8b' },
      { label: 'mistral:7b',        hint: 'Reliable all-rounder',  value: 'mistral:7b' },
      { label: 'deepseek-coder:6.7b',hint: 'Code specialist',      value: 'deepseek-coder:6.7b' },
      { label: 'phi4',              hint: 'Small but powerful',     value: 'phi4' },
    ];
    console.log(WHITE('Select Ollama model (must be pulled first):\n'));
    model = await selectMenu(ollamaModels, 0);
    console.log(`\n  ${DIM('Pull with:')} ${ORANGE(`ollama pull ${model}`)}\n`);
    console.log(`  ${GREEN('✓')} ${DIM('Model:')} ${WHITE(model)}\n`);
  }

  // ── Save to .env ─────────────────────────────────────────────────────────────
  // Resolve effective provider for providers that ride on openai-compatible
  let effectiveProvider: string = provider;
  if (provider === 'openrouter' || provider === 'deepseek' || provider === 'mistral') {
    effectiveProvider = 'openai-compatible';
  }

  envVars['CORECODE_DEFAULT_PROVIDER'] = effectiveProvider;
  envVars['CORECODE_DEFAULT_MODEL']    = model;
  envVars['CORECODE_THEME']            = theme;

  writeEnv(envPath, envVars);

  console.log(`  ${GREEN('✓')} ${DIM('Config saved to')} ${WHITE('.env')}`);
  console.log('');
  console.log(DIM('  Run') + WHITE(' /help') + DIM(' to see all available commands.'));
  console.log('');
}
