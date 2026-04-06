import chalk from 'chalk';
import type { ProviderName } from './state.js';

const ORANGE = chalk.hex('#E8955A');

const ENDPOINTS: Record<string, string> = {
  openai:            'https://api.openai.com/v1',
  gemini:            'https://generativelanguage.googleapis.com',
  anthropic:         'https://api.anthropic.com',
  groq:              'https://api.groq.com/openai/v1',
  ollama:            process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  openrouter:        'https://openrouter.ai/api/v1',
  deepseek:          'https://api.deepseek.com/v1',
  mistral:           'https://api.mistral.ai/v1',
  'openai-compatible': process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  mock:              '(demo — sem API)',
};

const PROVIDER_LABELS: Record<string, string> = {
  openai:            'OpenAI',
  gemini:            'Google Gemini',
  anthropic:         'Anthropic',
  groq:              'Groq',
  ollama:            'Ollama (local)',
  openrouter:        'OpenRouter',
  deepseek:          'DeepSeek',
  mistral:           'Mistral',
  'openai-compatible': 'OpenAI-Compatible',
  mock:              'Mock (demo)',
};

const LOCAL_PROVIDERS = new Set(['ollama', 'mock']);

function stripAnsi(s: string) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

function drawBox(provider: string, model: string): string {
  const endpoint = ENDPOINTS[provider] ?? '—';
  const col1 = 10;   // label column width (visible chars)
  const inner = 48;  // inner width (visible chars)

  // Build row: pad the raw label first, then apply color
  const row = (rawKey: string, val: string) => {
    const keyPadded  = rawKey.padEnd(col1);     // pad plain string
    const colored    = `  ${chalk.dim(keyPadded)}${val}`;
    const visibleLen = 2 + keyPadded.length + stripAnsi(val).length;
    const pad        = Math.max(0, inner - visibleLen);
    return `│${colored}${' '.repeat(pad)}│`;
  };

  const top    = `┌${'─'.repeat(inner)}┐`;
  const bottom = `└${'─'.repeat(inner)}┘`;

  return [
    top,
    row('Provider', ORANGE(PROVIDER_LABELS[provider] ?? provider)),
    row('Model',    chalk.white(model)),
    row('Endpoint', chalk.dim(endpoint)),
    bottom,
  ].join('\n');
}

export function showCoreCodeWelcome(provider?: string, model?: string) {
  const p = (provider || process.env.CORECODE_DEFAULT_PROVIDER || 'mock') as ProviderName;
  const m = model || '—';
  const isLocal = LOCAL_PROVIDERS.has(p);
  const modeLabel = p === 'mock' ? 'demo' : isLocal ? 'local' : 'cloud';

  console.log(drawBox(p, m));
  console.log('');
  console.log(
    ` ${ORANGE('●')} ${chalk.dim(modeLabel)}   ${chalk.dim('Ready — type')} ${chalk.white('/help')} ${chalk.dim('to begin')}`
  );
  console.log('');
  console.log(` ${chalk.dim('corecode')} ${chalk.dim('v0.2.1')}`);
  console.log('');
}
