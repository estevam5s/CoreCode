import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { CoreState, ProviderName } from './state.js';
import { BUILTIN_MODELS } from './state.js';
import { listModelsOpenAI } from './providers/openai.js';
import { listModelsOllama } from './providers/ollama.js';
import { listModelsGroq } from './providers/groq.js';
import { listModelsOpenRouter } from './providers/openrouter.js';
import { listModelsDeepSeek } from './providers/deepseek.js';
import { listModelsMistral } from './providers/mistral.js';

const ORANGE = chalk.hex('#E8955A');
const DIM = chalk.dim;

const VERSION = '0.1.9';

const DEFAULT_SYSTEM = 'You are CoreCode, an advanced AI coding assistant. Be concise and precise.';

const PROVIDERS: ProviderName[] = [
  'groq', 'openai', 'gemini', 'ollama', 'anthropic',
  'openai-compatible', 'openrouter', 'deepseek', 'mistral', 'mock',
];

const FREE_PROVIDERS = new Set<ProviderName>(['groq', 'ollama', 'mock']);
const LOCAL_PROVIDERS = new Set<ProviderName>(['ollama', 'mock']);

/** All slash commands exposed for autocomplete */
export interface SlashCommand {
  name: string;
  desc: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { name: '/help',       desc: 'show this help' },
  { name: '/status',     desc: 'show provider, model & history count' },
  { name: '/version',    desc: 'show CoreCode version' },
  { name: '/env',        desc: 'show environment & API key status' },
  { name: '/exit',       desc: 'exit CoreCode' },
  { name: '/quit',       desc: 'exit CoreCode' },
  { name: '/model',      desc: 'switch or show active model' },
  { name: '/models',     desc: 'list all available models for current provider' },
  { name: '/provider',   desc: 'switch or show active provider' },
  { name: '/providers',  desc: 'list all providers' },
  { name: '/add',        desc: 'register a custom model' },
  { name: '/key',        desc: 'set an API key at runtime' },
  { name: '/system',     desc: 'set or show system prompt' },
  { name: '/history',    desc: 'show conversation history' },
  { name: '/clear',      desc: 'clear conversation history' },
  { name: '/reset',      desc: 'clear history + reset system prompt' },
  { name: '/compact',    desc: 'compress history into a single summary' },
  { name: '/retry',      desc: 'resend your last message' },
  { name: '/copy',       desc: 'copy last AI response to clipboard' },
  { name: '/save',       desc: 'save conversation as markdown' },
  { name: '/export',     desc: 'alias for /save' },
  { name: '/tools',      desc: 'show available tools & status' },
  { name: '/search',     desc: 'search the web via DuckDuckGo' },
  { name: '/mode',       desc: 'set interaction mode (code|chat|explain)' },
  { name: '/tokens',     desc: 'estimate tokens used in current history' },
  { name: '/context',    desc: 'show context window usage' },
  { name: '/lang',       desc: 'set response language (e.g. /lang portuguese)' },
  { name: '/template',   desc: 'use a prompt template (bug|refactor|explain|test|review)' },
  { name: '/pin',        desc: 'pin a message to always be included in context' },
  { name: '/unpin',      desc: 'remove pinned message' },
  { name: '/diff',       desc: 'show last diff that was auto-applied' },
  { name: '/undo',       desc: 'undo last auto-applied diff' },
  { name: '/theme',      desc: 'change terminal color theme (orange|blue|green|purple|white)' },
  { name: '/debug',      desc: 'toggle debug mode' },
  { name: '/stats',      desc: 'show session statistics' },
];

function section(title: string) {
  return `\n ${chalk.white.bold(title)}\n ${DIM('─'.repeat(48))}\n`;
}

function row(cmd: string, desc: string) {
  return ` ${chalk.white(cmd.padEnd(32))} ${DIM(desc)}`;
}

const HELP = [
  section('Session'),
  row('/help',                       'show this help'),
  row('/status',                     'show provider, model & history count'),
  row('/version',                    'show CoreCode version'),
  row('/env',                        'show environment & API key status'),
  row('/exit  /quit',                'exit CoreCode'),
  '',
  section('Model & Provider'),
  row('/model',                      'show active model'),
  row('/model <name>',               'switch model'),
  row('/model list',                 'list builtin models for current provider'),
  row('/model list --all',           'fetch all models via API'),
  row('/models',                     'alias for /model list'),
  row('/provider',                   'show active provider'),
  row('/provider <name>',            'switch provider'),
  row('/provider list',              'list all providers with FREE / LOCAL tags'),
  row('/providers',                  'alias for /provider list'),
  row('/add <provider> <model>',     'register a custom model'),
  row('/key <provider> <api-key>',   'set an API key at runtime'),
  '',
  section('Conversation'),
  row('/history',                    'show conversation history'),
  row('/history full',               'show full message contents'),
  row('/clear',                      'clear conversation history'),
  row('/reset',                      'clear history + reset system prompt'),
  row('/compact',                    'compress history into a single summary'),
  row('/retry',                      'resend your last message'),
  row('/copy',                       'copy last AI response to clipboard'),
  '',
  section('System Prompt & Mode'),
  row('/system <prompt>',            'set system prompt'),
  row('/system show',                'show current system prompt'),
  row('/system reset',               'restore default system prompt'),
  row('/mode [code|chat|explain]',   'set interaction mode'),
  row('/lang <language>',            'set response language'),
  row('/pin <message>',              'pin a message to always include in context'),
  row('/unpin',                      'remove pinned message'),
  '',
  section('Tools & Info'),
  row('/search <query>',             'search the web via DuckDuckGo'),
  row('/tools',                      'show available tools & status'),
  row('/tokens',                     'estimate tokens used in current history'),
  row('/context',                    'show context window usage'),
  row('/template <name>',            'use prompt template (bug|refactor|explain|test|review)'),
  row('/diff',                       'show last diff that was auto-applied'),
  row('/undo',                       'undo last auto-applied diff'),
  row('!<command>',                  'execute shell command'),
  row('@<file>',                     'read file into context'),
  row('@<glob>',                     'read multiple files (e.g. @src/**/*.ts)'),
  '',
  section('Customisation'),
  row('/theme [orange|blue|green|purple|white]', 'change terminal color theme'),
  row('/debug',                      'toggle debug mode'),
  row('/stats',                      'show session statistics'),
  '',
  section('Export'),
  row('/save [file]',                'save conversation as markdown'),
  row('/export [file]',              'alias for /save'),
  '',
  ` ${DIM('File mentions auto-detected:')} ${DIM('"read src/index.ts"')} ${DIM('or')} ${DIM('"analyse package.json"')}`,
  ` ${DIM('Diffs auto-applied when AI response has')} ${ORANGE('// FILE: path')} ${DIM('markers')}`,
  '',
  ` ${DIM('Free providers:')} ${ORANGE('groq')} ${DIM('·')} ${ORANGE('ollama')} ${DIM('·')} ${ORANGE('mock')}`,
  '',
].join('\n');

export type CommandResult =
  | { type: 'handled' }
  | { type: 'exit' }
  | { type: 'retry' }
  | { type: 'unknown' };

// ── helpers ──────────────────────────────────────────────────────────────────

function keyEnvVar(provider: ProviderName): string {
  const map: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    groq: 'GROQ_API_KEY',
    gemini: 'GEMINI_API_KEY',
    'openai-compatible': 'OPENAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    ollama: '',
    mock: '',
  };
  return map[provider] ?? '';
}

function maskKey(key: string | undefined): string {
  if (!key) return DIM('not set');
  if (key.length <= 8) return chalk.green('set');
  return chalk.green(key.slice(0, 4) + '…' + key.slice(-4));
}

function saveConversationMarkdown(state: CoreState, filePath: string) {
  const lines: string[] = [
    `# CoreCode Conversation\n`,
    `**Provider:** ${state.provider}  `,
    `**Model:** ${state.model}  `,
    `**Date:** ${new Date().toISOString()}\n`,
    '---\n',
  ];
  for (const msg of state.history) {
    if (msg.role === 'user') {
      lines.push(`### You\n${msg.content}\n`);
    } else if (msg.role === 'assistant') {
      lines.push(`### CoreCode\n${msg.content}\n`);
    }
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

/** Rough token estimate: ~4 chars per token */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function getTotalTokensEstimate(state: CoreState): number {
  return state.history.reduce((sum, m) => sum + estimateTokens(m.content), 0)
    + estimateTokens(state.systemPrompt)
    + (state.pinnedMessage ? estimateTokens(state.pinnedMessage) : 0);
}

const PROMPT_TEMPLATES: Record<string, string> = {
  bug: 'You are a debugging expert. Carefully analyze the following bug and provide a clear diagnosis and fix:\n\n',
  refactor: 'You are a code quality expert. Refactor the following code for clarity, performance, and maintainability. Explain each change:\n\n',
  explain: 'You are a patient teacher. Explain the following code step by step in simple terms, covering what it does and why:\n\n',
  test: 'You are a test-driven development expert. Write comprehensive unit tests for the following code, covering edge cases:\n\n',
  review: 'You are a senior code reviewer. Review the following code for bugs, security issues, performance problems, and style. Be thorough:\n\n',
};

// ── main handler ─────────────────────────────────────────────────────────────

export async function handleCommand(
  input: string,
  state: CoreState,
): Promise<CommandResult> {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {

    // ── /help ──────────────────────────────────────────────────────────────
    case '/help': {
      console.log(HELP);
      return { type: 'handled' };
    }

    // ── /version ───────────────────────────────────────────────────────────
    case '/version': {
      console.log(`\n ${ORANGE('CoreCode')} ${DIM('v' + VERSION)}\n`);
      return { type: 'handled' };
    }

    // ── /status ────────────────────────────────────────────────────────────
    case '/status': {
      const sysShort = state.systemPrompt.length > 60
        ? state.systemPrompt.slice(0, 57) + '…'
        : state.systemPrompt;
      console.log(`\n ${DIM('provider')}  ${ORANGE(state.provider)}`);
      console.log(` ${DIM('model')}     ${chalk.white(state.model)}`);
      console.log(` ${DIM('history')}   ${chalk.white(state.history.length + ' messages')}`);
      console.log(` ${DIM('mode')}      ${chalk.white(state.mode)}`);
      console.log(` ${DIM('theme')}     ${chalk.white(state.theme)}`);
      console.log(` ${DIM('debug')}     ${chalk.white(state.debugMode ? 'on' : 'off')}`);
      if (state.pinnedMessage) {
        const pinShort = state.pinnedMessage.length > 50
          ? state.pinnedMessage.slice(0, 47) + '…'
          : state.pinnedMessage;
        console.log(` ${DIM('pinned')}    ${DIM(pinShort)}`);
      }
      if (state.responseLanguage) {
        console.log(` ${DIM('lang')}      ${chalk.white(state.responseLanguage)}`);
      }
      console.log(` ${DIM('system')}    ${DIM(sysShort)}\n`);
      return { type: 'handled' };
    }

    // ── /env ───────────────────────────────────────────────────────────────
    case '/env': {
      console.log(`\n ${DIM('environment & keys')}\n`);
      for (const p of PROVIDERS) {
        const envVar = keyEnvVar(p as ProviderName);
        if (!envVar) {
          const tag = LOCAL_PROVIDERS.has(p as ProviderName) ? DIM(' local — no key needed') : '';
          console.log(` ${DIM('○')} ${DIM(p.padEnd(20))}${tag}`);
        } else {
          const val = process.env[envVar];
          console.log(` ${val ? ORANGE('●') : DIM('○')} ${DIM(p.padEnd(20))} ${maskKey(val)}`);
        }
      }
      console.log('');
      console.log(` ${DIM('CORECODE_DEFAULT_PROVIDER')}  ${DIM(process.env.CORECODE_DEFAULT_PROVIDER ?? 'not set')}`);
      console.log(` ${DIM('CORECODE_DEFAULT_MODEL')}     ${DIM(process.env.CORECODE_DEFAULT_MODEL ?? 'not set')}`);
      console.log(` ${DIM('OLLAMA_BASE_URL')}            ${DIM(process.env.OLLAMA_BASE_URL ?? 'not set')}`);
      console.log('');
      return { type: 'handled' };
    }

    // ── /model ─────────────────────────────────────────────────────────────
    case '/model': {
      if (!args.length) {
        // Show current model + hint
        console.log(`\n ${DIM('model ativo')}  ${ORANGE(state.provider)} ${DIM('/')} ${chalk.white(state.model)}`);
        console.log(` ${DIM('dica: /model list              — listar modelos do provider atual')}`);
        console.log(` ${DIM('      /model list <busca>       — filtrar modelos')}`);
        console.log(` ${DIM('      /model <nome>             — trocar modelo')}\n`);
        return { type: 'handled' };
      }

      if (args[0] === 'list' || args[0] === 'ls') {
        const filter = args.slice(1).filter(a => a !== '--all').join(' ').toLowerCase();
        let models: string[] = BUILTIN_MODELS[state.provider] ?? [];

        const custom = state.customModels
          .filter((m) => m.provider === state.provider)
          .map((m) => m.model);

        const allModels = [...new Set([...models, ...custom])];
        const filtered  = filter
          ? allModels.filter(m => m.toLowerCase().includes(filter))
          : allModels;

        const total = filtered.length;
        console.log(`\n ${DIM('modelos disponíveis para')} ${ORANGE(state.provider)}${filter ? DIM(` (filtro: "${filter}")`) : ''} ${DIM(`— ${total} modelo${total !== 1 ? 's' : ''}`)}\n`);

        // Group by provider prefix (useful for openrouter)
        const isOpenRouter = state.provider === 'openrouter';
        if (isOpenRouter && !filter) {
          const groups = new Map<string, string[]>();
          for (const m of filtered) {
            const prefix = m.includes('/') ? m.split('/')[0] : 'outros';
            if (!groups.has(prefix)) groups.set(prefix, []);
            groups.get(prefix)!.push(m);
          }
          // Show each group
          for (const [group, gModels] of groups) {
            console.log(` ${chalk.hex('#7eb8f7')(group)} ${DIM(`(${gModels.length})`)}`);
            for (const m of gModels.slice(0, 6)) {
              const active = m === state.model;
              const modelName = m.split('/').pop() ?? m;
              console.log(
                `   ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(modelName) : DIM(modelName)}${active ? chalk.dim(' ← ativo') : ''}`
              );
            }
            if (gModels.length > 6) {
              console.log(`   ${DIM(`… +${gModels.length - 6} mais — use /model list ${group} para ver todos`)}`);
            }
          }
        } else {
          for (const m of filtered) {
            const active = m === state.model;
            console.log(
              ` ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(m) : DIM(m)}${active ? chalk.dim(' ← ativo') : ''}`
            );
          }
        }

        if (isOpenRouter && !filter) {
          console.log(`\n ${DIM('dica: /model list <busca>   ex: /model list gpt  /model list claude')}`);
        }
        console.log('');
        return { type: 'handled' };
      }

      // /model search <query> — alias
      if (args[0] === 'search') {
        const query = args.slice(1).join(' ').toLowerCase();
        const models = BUILTIN_MODELS[state.provider] ?? [];
        const found = query ? models.filter(m => m.toLowerCase().includes(query)) : models;
        console.log(`\n ${DIM(`${found.length} modelo(s) para "${query}" em`)} ${ORANGE(state.provider)}\n`);
        for (const m of found) {
          const active = m === state.model;
          console.log(` ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(m) : DIM(m)}`);
        }
        console.log('');
        return { type: 'handled' };
      }

      state.model = args.join(' ');
      console.log(`\n ${ORANGE('●')} model → ${chalk.white(state.model)}\n`);
      return { type: 'handled' };
    }

    // ── /models (alias for /model list) ────────────────────────────────────
    case '/models': {
      const filter = args.join(' ').toLowerCase();
      const models: string[] = BUILTIN_MODELS[state.provider] ?? [];
      const custom = state.customModels
        .filter((m) => m.provider === state.provider)
        .map((m) => m.model);
      const allModels = [...new Set([...models, ...custom])];
      const filtered = filter ? allModels.filter(m => m.toLowerCase().includes(filter)) : allModels;

      console.log(`\n ${DIM('modelos para')} ${ORANGE(state.provider)} ${DIM(`— ${filtered.length} modelo(s)`)}\n`);
      for (const m of filtered) {
        const active = m === state.model;
        console.log(
          ` ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(m) : DIM(m)}${active ? chalk.dim(' ← ativo') : ''}`,
        );
      }
      if (state.provider === 'openrouter' && !filter) {
        console.log(`\n ${DIM('dica: /models <busca>   ex: /models gpt   /models claude   /models llama')}`);
      }
      console.log('');
      return { type: 'handled' };
    }

    // ── /provider ──────────────────────────────────────────────────────────
    case '/provider': {
      if (!args.length) {
        console.log(`\n ${DIM('provider')}  ${ORANGE(state.provider)}\n`);
        return { type: 'handled' };
      }

      if (args[0] === 'list') {
        console.log(`\n ${DIM('available providers')}\n`);
        for (const p of PROVIDERS) {
          const active = p === state.provider;
          const tags = [
            FREE_PROVIDERS.has(p) ? DIM(' free') : DIM(' paid'),
            LOCAL_PROVIDERS.has(p) ? DIM(' local') : DIM(' cloud'),
          ].join('');
          console.log(
            ` ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(p.padEnd(22)) : DIM(p.padEnd(22))}${tags}${active ? chalk.dim(' ← active') : ''}`,
          );
        }
        console.log('');
        return { type: 'handled' };
      }

      const newProvider = args[0] as ProviderName;
      if (!PROVIDERS.includes(newProvider)) {
        console.log(`\n ${DIM('unknown provider:')} ${chalk.white(newProvider)} ${DIM('— run /provider list')}\n`);
        return { type: 'handled' };
      }

      state.provider = newProvider;
      state.model = BUILTIN_MODELS[newProvider]?.[0] ?? state.model;
      console.log(`\n ${ORANGE('●')} ${chalk.white(state.provider)} ${DIM('·')} ${chalk.white(state.model)}\n`);
      return { type: 'handled' };
    }

    // ── /providers (alias for /provider list) ──────────────────────────────
    case '/providers': {
      console.log(`\n ${DIM('available providers')}\n`);
      for (const p of PROVIDERS) {
        const active = p === state.provider;
        const tags = [
          FREE_PROVIDERS.has(p) ? DIM(' free') : DIM(' paid'),
          LOCAL_PROVIDERS.has(p) ? DIM(' local') : DIM(' cloud'),
        ].join('');
        console.log(
          ` ${active ? ORANGE('●') : DIM('○')} ${active ? chalk.white(p.padEnd(22)) : DIM(p.padEnd(22))}${tags}${active ? chalk.dim(' ← active') : ''}`,
        );
      }
      console.log('');
      return { type: 'handled' };
    }

    // ── /add ───────────────────────────────────────────────────────────────
    case '/add': {
      if (args.length < 2) {
        console.log(`\n ${DIM('usage: /add <provider> <model-name>')}\n`);
        return { type: 'handled' };
      }
      const [provider, ...modelParts] = args;
      const model = modelParts.join(' ');
      state.customModels.push({ provider: provider as ProviderName, model });
      console.log(`\n ${ORANGE('+')} ${chalk.white(model)} ${DIM('added to')} ${chalk.white(provider)}\n`);
      return { type: 'handled' };
    }

    // ── /key ───────────────────────────────────────────────────────────────
    case '/key': {
      if (args.length < 2) {
        console.log(`\n ${DIM('usage: /key <provider> <api-key>')}\n`);
        return { type: 'handled' };
      }
      const [provider, apiKey] = args;
      const envVar = keyEnvVar(provider as ProviderName);
      if (!envVar) {
        console.log(`\n ${DIM('provider')} ${chalk.white(provider)} ${DIM('does not need an API key')}\n`);
        return { type: 'handled' };
      }
      process.env[envVar] = apiKey;
      console.log(`\n ${ORANGE('●')} ${chalk.white(envVar)} ${DIM('set for this session')} ${maskKey(apiKey)}\n`);
      return { type: 'handled' };
    }

    // ── /system ────────────────────────────────────────────────────────────
    case '/system': {
      if (!args.length) {
        console.log(`\n ${DIM('usage: /system <prompt>  ·  /system show  ·  /system reset')}\n`);
        return { type: 'handled' };
      }
      if (args[0] === 'show') {
        console.log(`\n ${DIM(state.systemPrompt)}\n`);
        return { type: 'handled' };
      }
      if (args[0] === 'reset') {
        state.systemPrompt = DEFAULT_SYSTEM;
        console.log(`\n ${ORANGE('●')} ${DIM('system prompt restored to default')}\n`);
        return { type: 'handled' };
      }
      state.systemPrompt = args.join(' ');
      console.log(`\n ${ORANGE('●')} ${DIM('system prompt updated')}\n`);
      return { type: 'handled' };
    }

    // ── /history ───────────────────────────────────────────────────────────
    case '/history': {
      if (!state.history.length) {
        console.log(`\n ${DIM('no history yet')}\n`);
        return { type: 'handled' };
      }
      const full = args[0] === 'full';
      const limit = full ? Infinity : 120;
      console.log('');
      for (let i = 0; i < state.history.length; i++) {
        const msg = state.history[i];
        const isUser = msg.role === 'user';
        const label = isUser ? chalk.white(`[${i + 1}] you`) : ORANGE(`[${i + 1}] ●`);
        const text = full
          ? msg.content
          : msg.content.slice(0, limit) + (msg.content.length > limit ? '…' : '');
        console.log(` ${label}`);
        console.log(`   ${isUser ? chalk.white(text) : DIM(text)}`);
        console.log('');
      }
      return { type: 'handled' };
    }

    // ── /clear ─────────────────────────────────────────────────────────────
    case '/clear': {
      state.history.length = 0;
      console.log(`\n ${DIM('history cleared')}\n`);
      return { type: 'handled' };
    }

    // ── /reset ─────────────────────────────────────────────────────────────
    case '/reset': {
      state.history.length = 0;
      state.systemPrompt = DEFAULT_SYSTEM;
      state.lastResponse = '';
      state.lastUserMessage = '';
      state.pinnedMessage = '';
      state.responseLanguage = '';
      console.log(`\n ${ORANGE('●')} ${DIM('session reset — history cleared, system prompt restored')}\n`);
      return { type: 'handled' };
    }

    // ── /compact ───────────────────────────────────────────────────────────
    case '/compact': {
      if (state.history.length < 4) {
        console.log(`\n ${DIM('history too short to compact')}\n`);
        return { type: 'handled' };
      }
      const count = state.history.length;
      const summary = state.history
        .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content.slice(0, 80)}`)
        .join('\n');
      state.history.length = 0;
      state.history.push({
        role: 'user',
        content: `[Compacted history — ${count} messages]\n${summary}`,
      });
      console.log(`\n ${ORANGE('●')} ${DIM(`${count} messages compacted into summary`)}\n`);
      return { type: 'handled' };
    }

    // ── /retry ─────────────────────────────────────────────────────────────
    case '/retry': {
      if (!state.lastUserMessage) {
        console.log(`\n ${DIM('nothing to retry yet')}\n`);
        return { type: 'handled' };
      }
      return { type: 'retry' };
    }

    // ── /copy ──────────────────────────────────────────────────────────────
    case '/copy': {
      if (!state.lastResponse) {
        console.log(`\n ${DIM('no response to copy yet')}\n`);
        return { type: 'handled' };
      }
      try {
        execSync('pbcopy', { input: state.lastResponse });
        console.log(`\n ${ORANGE('●')} ${DIM('response copied to clipboard')}\n`);
      } catch {
        try {
          execSync('xclip -selection clipboard', { input: state.lastResponse });
          console.log(`\n ${ORANGE('●')} ${DIM('response copied to clipboard')}\n`);
        } catch {
          console.log(`\n ${DIM('clipboard not available — pipe manually with !echo ...')}\n`);
        }
      }
      return { type: 'handled' };
    }

    // ── /save  /export ─────────────────────────────────────────────────────
    case '/save':
    case '/export': {
      if (!state.history.length) {
        console.log(`\n ${DIM('nothing to save yet')}\n`);
        return { type: 'handled' };
      }
      const defaultName = `corecode-${new Date().toISOString().slice(0, 10)}.md`;
      const file = args[0] ?? defaultName;
      const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
      try {
        saveConversationMarkdown(state, filePath);
        console.log(`\n ${ORANGE('●')} ${DIM('saved →')} ${chalk.white(filePath)}\n`);
      } catch (e: unknown) {
        console.log(`\n ${DIM('error saving: ' + (e as Error).message)}\n`);
      }
      return { type: 'handled' };
    }

    // ── /tools ─────────────────────────────────────────────────────────────
    case '/tools': {
      console.log(`\n ${DIM('available tools')}\n`);
      const tools = [
        { name: 'file',   desc: 'read files via @path or auto-detection',     active: true },
        { name: 'bash',   desc: 'run shell commands with !<cmd>',              active: true },
        { name: 'search', desc: 'web search via /search <query>',              active: true },
        { name: 'diff',   desc: 'auto-apply code patches (// FILE: markers)', active: true },
      ];
      for (const t of tools) {
        console.log(` ${ORANGE('●')} ${chalk.white(t.name.padEnd(10))} ${DIM(t.desc)}`);
      }
      console.log('');
      return { type: 'handled' };
    }

    // ── /mode ──────────────────────────────────────────────────────────────
    case '/mode': {
      const validModes = ['code', 'chat', 'explain'] as const;
      type Mode = typeof validModes[number];

      if (!args.length) {
        console.log(`\n ${DIM('mode')}  ${chalk.white(state.mode)}\n`);
        console.log(` ${DIM('available:')} ${validModes.map((m) => chalk.white(m)).join(DIM(' · '))}\n`);
        return { type: 'handled' };
      }

      const newMode = args[0] as Mode;
      if (!validModes.includes(newMode)) {
        console.log(`\n ${DIM('unknown mode:')} ${chalk.white(args[0])} ${DIM('— use code, chat, or explain')}\n`);
        return { type: 'handled' };
      }

      state.mode = newMode;

      const modeSystemAddons: Record<Mode, string> = {
        code: 'Respond concisely. Prefer code snippets over prose. Skip unnecessary explanations.',
        chat: 'Be conversational, friendly, and helpful.',
        explain: 'Provide detailed, step-by-step explanations. Assume the user is learning.',
      };

      // Append mode instruction to system prompt
      const baseSystem = state.systemPrompt.replace(/ \[mode:.*?\]$/, '');
      state.systemPrompt = `${baseSystem} [mode: ${modeSystemAddons[newMode]}]`;

      console.log(`\n ${ORANGE('●')} mode → ${chalk.white(newMode)}\n`);
      return { type: 'handled' };
    }

    // ── /tokens ────────────────────────────────────────────────────────────
    case '/tokens': {
      const total = getTotalTokensEstimate(state);
      const historyTokens = state.history.reduce((s, m) => s + estimateTokens(m.content), 0);
      const systemTokens = estimateTokens(state.systemPrompt);
      const pinnedTokens = state.pinnedMessage ? estimateTokens(state.pinnedMessage) : 0;

      console.log(`\n ${DIM('token estimate (≈4 chars per token)')}\n`);
      console.log(` ${DIM('system prompt')}  ${chalk.white(systemTokens.toLocaleString())}`);
      console.log(` ${DIM('history')}        ${chalk.white(historyTokens.toLocaleString())}`);
      if (pinnedTokens) {
        console.log(` ${DIM('pinned msg')}     ${chalk.white(pinnedTokens.toLocaleString())}`);
      }
      console.log(` ${DIM('total')}          ${ORANGE(total.toLocaleString())}\n`);
      return { type: 'handled' };
    }

    // ── /context ───────────────────────────────────────────────────────────
    case '/context': {
      const total = getTotalTokensEstimate(state);
      // Rough context window sizes by provider
      const contextWindows: Record<string, number> = {
        openai: 128_000,
        gemini: 1_000_000,
        anthropic: 200_000,
        groq: 32_768,
        openrouter: 200_000,
        deepseek: 64_000,
        mistral: 128_000,
        ollama: 8_192,
        'openai-compatible': 128_000,
        mock: 4_096,
      };
      const windowSize = contextWindows[state.provider] ?? 128_000;
      const pct = Math.min(100, Math.round((total / windowSize) * 100));
      const barWidth = 30;
      const filled = Math.round((pct / 100) * barWidth);
      const bar = ORANGE('█'.repeat(filled)) + DIM('░'.repeat(barWidth - filled));

      console.log(`\n ${DIM('context window usage')}\n`);
      console.log(` ${bar} ${chalk.white(pct + '%')}`);
      console.log(` ${DIM('used')}    ${chalk.white(total.toLocaleString())} tokens`);
      console.log(` ${DIM('limit')}   ${chalk.white(windowSize.toLocaleString())} tokens`);
      console.log(` ${DIM('free')}    ${chalk.white((windowSize - total).toLocaleString())} tokens\n`);
      return { type: 'handled' };
    }

    // ── /lang ──────────────────────────────────────────────────────────────
    case '/lang': {
      if (!args.length) {
        if (state.responseLanguage) {
          console.log(`\n ${DIM('language')}  ${chalk.white(state.responseLanguage)}\n`);
        } else {
          console.log(`\n ${DIM('no language set (default: English)')}\n`);
          console.log(` ${DIM('usage: /lang <language>  e.g. /lang portuguese')}\n`);
        }
        return { type: 'handled' };
      }

      const lang = args.join(' ');
      state.responseLanguage = lang;

      // Inject language instruction into system prompt
      const baseSystem = state.systemPrompt.replace(/ \[respond in .*?\]$/, '');
      state.systemPrompt = `${baseSystem} [respond in ${lang}]`;

      console.log(`\n ${ORANGE('●')} language → ${chalk.white(lang)}\n`);
      return { type: 'handled' };
    }

    // ── /template ──────────────────────────────────────────────────────────
    case '/template': {
      const available = Object.keys(PROMPT_TEMPLATES);
      if (!args.length) {
        console.log(`\n ${DIM('available templates:')}\n`);
        for (const name of available) {
          console.log(` ${ORANGE('●')} ${chalk.white(name.padEnd(12))} ${DIM(PROMPT_TEMPLATES[name].slice(0, 60) + '…')}`);
        }
        console.log(`\n ${DIM('usage: /template <name>')}\n`);
        return { type: 'handled' };
      }

      const tplName = args[0].toLowerCase();
      const tpl = PROMPT_TEMPLATES[tplName];
      if (!tpl) {
        console.log(`\n ${DIM('unknown template:')} ${chalk.white(tplName)}\n`);
        console.log(` ${DIM('available:')} ${available.join(', ')}\n`);
        return { type: 'handled' };
      }

      state.systemPrompt = tpl + state.systemPrompt;
      console.log(`\n ${ORANGE('●')} template ${chalk.white(tplName)} ${DIM('applied to system prompt')}\n`);
      return { type: 'handled' };
    }

    // ── /pin ───────────────────────────────────────────────────────────────
    case '/pin': {
      if (!args.length) {
        if (state.pinnedMessage) {
          console.log(`\n ${DIM('pinned:')} ${chalk.white(state.pinnedMessage)}\n`);
        } else {
          console.log(`\n ${DIM('no message pinned')}\n`);
          console.log(` ${DIM('usage: /pin <message>')}\n`);
        }
        return { type: 'handled' };
      }
      state.pinnedMessage = args.join(' ');
      console.log(`\n ${ORANGE('●')} pinned: ${DIM(state.pinnedMessage)}\n`);
      return { type: 'handled' };
    }

    // ── /unpin ─────────────────────────────────────────────────────────────
    case '/unpin': {
      if (!state.pinnedMessage) {
        console.log(`\n ${DIM('nothing pinned')}\n`);
        return { type: 'handled' };
      }
      state.pinnedMessage = '';
      console.log(`\n ${ORANGE('●')} ${DIM('pinned message removed')}\n`);
      return { type: 'handled' };
    }

    // ── /diff ──────────────────────────────────────────────────────────────
    case '/diff': {
      if (!state.lastDiff) {
        console.log(`\n ${DIM('no diff has been applied yet')}\n`);
        return { type: 'handled' };
      }
      console.log(`\n ${DIM('last applied diff:')}\n`);
      console.log(state.lastDiff);
      console.log('');
      return { type: 'handled' };
    }

    // ── /undo ──────────────────────────────────────────────────────────────
    case '/undo': {
      const entries = Object.entries(state.diffBackup);
      if (!entries.length) {
        console.log(`\n ${DIM('no diff to undo')}\n`);
        return { type: 'handled' };
      }
      let restored = 0;
      for (const [filePath, originalContent] of entries) {
        try {
          fs.writeFileSync(filePath, originalContent, 'utf-8');
          console.log(` ${ORANGE('●')} ${DIM('restored')} ${chalk.white(filePath)}`);
          restored++;
        } catch (e: unknown) {
          console.log(` ${DIM('error restoring')} ${chalk.white(filePath)}: ${DIM((e as Error).message)}`);
        }
      }
      state.diffBackup = {};
      state.lastDiff = '';
      console.log(`\n ${ORANGE('●')} ${DIM(`${restored} file(s) restored`)}\n`);
      return { type: 'handled' };
    }

    // ── /theme ─────────────────────────────────────────────────────────────
    case '/theme': {
      const validThemes = ['orange', 'blue', 'green', 'purple', 'white'] as const;
      type Theme = typeof validThemes[number];

      if (!args.length) {
        console.log(`\n ${DIM('theme')}  ${chalk.white(state.theme)}\n`);
        console.log(` ${DIM('available:')} ${validThemes.join(', ')}\n`);
        return { type: 'handled' };
      }

      const newTheme = args[0] as Theme;
      if (!validThemes.includes(newTheme)) {
        console.log(`\n ${DIM('unknown theme:')} ${chalk.white(args[0])} ${DIM('— use: ' + validThemes.join(', '))}\n`);
        return { type: 'handled' };
      }

      state.theme = newTheme;
      const themeColors: Record<Theme, string> = {
        orange: '#E8955A',
        blue: '#5A9BE8',
        green: '#5AE895',
        purple: '#9B5AE8',
        white: '#FFFFFF',
      };
      const preview = chalk.hex(themeColors[newTheme])('●');
      console.log(`\n ${preview} theme → ${chalk.white(newTheme)}\n`);
      return { type: 'handled' };
    }

    // ── /debug ─────────────────────────────────────────────────────────────
    case '/debug': {
      state.debugMode = !state.debugMode;
      const status = state.debugMode ? ORANGE('on') : DIM('off');
      console.log(`\n ${DIM('debug mode')}  ${status}\n`);
      return { type: 'handled' };
    }

    // ── /stats ─────────────────────────────────────────────────────────────
    case '/stats': {
      const elapsed = Date.now() - state.startTime.getTime();
      const secs = Math.floor(elapsed / 1000);
      const mins = Math.floor(secs / 60);
      const hours = Math.floor(mins / 60);
      const timeStr = hours > 0
        ? `${hours}h ${mins % 60}m`
        : mins > 0
          ? `${mins}m ${secs % 60}s`
          : `${secs}s`;

      const totalTokens = getTotalTokensEstimate(state);
      const msgCount = state.history.length;
      const userMsgs = state.history.filter((m) => m.role === 'user').length;
      const aiMsgs = state.history.filter((m) => m.role === 'assistant').length;

      console.log(`\n ${DIM('session statistics')}\n`);
      console.log(` ${DIM('uptime')}          ${chalk.white(timeStr)}`);
      console.log(` ${DIM('total messages')}  ${chalk.white(msgCount)}`);
      console.log(` ${DIM('  user')}          ${chalk.white(userMsgs)}`);
      console.log(` ${DIM('  assistant')}     ${chalk.white(aiMsgs)}`);
      console.log(` ${DIM('tokens (est.)')}   ${ORANGE(totalTokens.toLocaleString())}`);
      console.log(` ${DIM('provider')}        ${chalk.white(state.provider)}`);
      console.log(` ${DIM('model')}           ${chalk.white(state.model)}`);
      console.log(` ${DIM('mode')}            ${chalk.white(state.mode)}`);
      console.log(` ${DIM('debug')}           ${chalk.white(state.debugMode ? 'on' : 'off')}\n`);
      return { type: 'handled' };
    }

    // ── /exit  /quit ───────────────────────────────────────────────────────
    case '/exit':
    case '/quit': {
      return { type: 'exit' };
    }

    default:
      return { type: 'unknown' };
  }
}
