import readline from 'readline';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ProviderName } from './state.js';

const PROVIDER_KEYS: Record<ProviderName, { env: string; label: string; url: string }> = {
  openai: {
    env: 'OPENAI_API_KEY',
    label: 'OpenAI API Key',
    url: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    env: 'GEMINI_API_KEY',
    label: 'Google Gemini API Key',
    url: 'https://aistudio.google.com/app/apikey',
  },
  anthropic: {
    env: 'ANTHROPIC_API_KEY',
    label: 'Anthropic API Key',
    url: 'https://console.anthropic.com/settings/keys',
  },
  ollama: {
    env: '',
    label: 'Ollama (local, sem chave)',
    url: 'https://ollama.ai',
  },
  'openai-compatible': {
    env: 'OPENAI_API_KEY',
    label: 'API Key (OpenAI-compatible)',
    url: '',
  },
};

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export function hasAnyKey(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OLLAMA_BASE_URL
  );
}

export function getMissingKeyMessage(provider: ProviderName): string {
  const info = PROVIDER_KEYS[provider];
  if (!info || provider === 'ollama') {
    return chalk.gray(
      `Ollama não está acessível em ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}.\n` +
      `Instale em https://ollama.ai e rode: ollama serve`
    );
  }
  return (
    chalk.white(`Chave ausente: `) + chalk.bold(info.env) + '\n' +
    chalk.gray(`Obtenha em: ${info.url}`) + '\n' +
    chalk.gray(`Depois adicione ao .env: ${info.env}=sk-...`) + '\n' +
    chalk.gray(`Ou troque de provider com: /provider gemini | anthropic | ollama`)
  );
}

export async function runSetupWizard(envPath: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(chalk.white.bold('\n  Nenhuma chave de API encontrada.'));
  console.log(chalk.gray('  Vamos configurar o CoreCode agora.\n'));

  console.log(chalk.white('  Escolha um provider:\n'));
  const providers: ProviderName[] = ['openai', 'gemini', 'anthropic', 'ollama'];
  providers.forEach((p, i) => {
    const info = PROVIDER_KEYS[p];
    console.log(`  ${chalk.bold(String(i + 1))}. ${chalk.white(p.padEnd(12))} ${chalk.gray(info.label)}`);
  });

  const choice = await ask(rl, chalk.white('\n  Escolha (1-4): '));
  const idx = parseInt(choice) - 1;
  const provider = providers[idx] ?? 'openai';
  const info = PROVIDER_KEYS[provider];

  let apiKey = '';
  if (provider !== 'ollama' && info.env) {
    console.log(chalk.gray(`\n  Obtenha sua chave em: ${info.url}`));
    apiKey = await ask(rl, chalk.white(`  Cole sua ${info.label}: `));
    apiKey = apiKey.trim();
  } else {
    console.log(chalk.gray('\n  Ollama: certifique-se que `ollama serve` está rodando.'));
  }

  rl.close();

  // update .env
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  if (provider !== 'ollama' && info.env && apiKey) {
    const regex = new RegExp(`^${info.env}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${info.env}=${apiKey}`);
    } else {
      envContent += `\n${info.env}=${apiKey}`;
    }
  }

  // set default provider
  const providerRegex = /^CORECODE_DEFAULT_PROVIDER=.*$/m;
  if (providerRegex.test(envContent)) {
    envContent = envContent.replace(providerRegex, `CORECODE_DEFAULT_PROVIDER=${provider}`);
  } else {
    envContent += `\nCORECODE_DEFAULT_PROVIDER=${provider}`;
  }

  fs.writeFileSync(envPath, envContent);

  // apply to process.env immediately
  if (provider !== 'ollama' && info.env && apiKey) {
    process.env[info.env] = apiKey;
  }
  process.env.CORECODE_DEFAULT_PROVIDER = provider;

  console.log(chalk.white('\n  Configuração salva em .env\n'));
}
