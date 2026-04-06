import chalk from 'chalk';
import type { CoreState, ProviderName } from './state.js';
import { BUILTIN_MODELS } from './state.js';
import { listModelsOpenAI } from './providers/openai.js';
import { listModelsOllama } from './providers/ollama.js';

const PROVIDERS: ProviderName[] = ['openai', 'gemini', 'ollama', 'anthropic', 'openai-compatible'];

const HELP = `
${chalk.white.bold('CoreCode — Comandos disponíveis')}
${chalk.gray('─────────────────────────────────────────────────────────')}

  ${chalk.white('/help')}                    Mostra esta ajuda
  ${chalk.white('/model')}                   Mostra o modelo atual
  ${chalk.white('/model <nome>')}            Troca o modelo
  ${chalk.white('/model list')}              Lista modelos do provider atual
  ${chalk.white('/model list --all')}        Lista todos os modelos (via API)
  ${chalk.white('/provider')}               Mostra o provider atual
  ${chalk.white('/provider <nome>')}         Troca o provider
  ${chalk.white('/provider list')}           Lista providers disponíveis
  ${chalk.white('/add <provider> <model>')} Adiciona modelo personalizado
  ${chalk.white('/system <prompt>')}         Define o system prompt
  ${chalk.white('/system show')}             Mostra o system prompt atual
  ${chalk.white('/history')}                Mostra histórico da conversa
  ${chalk.white('/clear')}                  Limpa o histórico
  ${chalk.white('/status')}                 Mostra provider + modelo + histórico
  ${chalk.white('/exit')} ou ${chalk.white('/quit')}          Sai do CoreCode

${chalk.gray('Providers: openai | gemini | ollama | anthropic | openai-compatible')}
`;

export type CommandResult =
  | { type: 'handled' }
  | { type: 'exit' }
  | { type: 'unknown' };

export async function handleCommand(
  input: string,
  state: CoreState
): Promise<CommandResult> {
  const [cmd, ...args] = input.trim().split(/\s+/);

  switch (cmd) {
    case '/help': {
      console.log(HELP);
      return { type: 'handled' };
    }

    case '/status': {
      console.log(chalk.white(`Provider : ${chalk.bold(state.provider)}`));
      console.log(chalk.white(`Modelo   : ${chalk.bold(state.model)}`));
      console.log(chalk.white(`Histórico: ${state.history.length} mensagens`));
      console.log(chalk.white(`System   : ${state.systemPrompt.slice(0, 80)}...`));
      return { type: 'handled' };
    }

    case '/model': {
      if (!args.length) {
        console.log(chalk.white(`Modelo atual: ${chalk.bold(state.model)}`));
        return { type: 'handled' };
      }

      if (args[0] === 'list') {
        const fetchAll = args.includes('--all');
        let models: string[] = BUILTIN_MODELS[state.provider] ?? [];

        if (fetchAll) {
          try {
            if (state.provider === 'openai' || state.provider === 'openai-compatible') {
              models = await listModelsOpenAI();
            } else if (state.provider === 'ollama') {
              models = await listModelsOllama();
            }
          } catch (e: unknown) {
            console.log(chalk.gray(`(Não foi possível buscar via API: ${(e as Error).message})`));
          }
        }

        const custom = state.customModels
          .filter((m) => m.provider === state.provider)
          .map((m) => `${m.model} ${chalk.gray('[custom]')}`);

        const all = [...models.map((m) => (m === state.model ? chalk.white.bold(`${m} ←`) : chalk.gray(m))), ...custom];
        console.log(chalk.white(`\nModelos para ${chalk.bold(state.provider)}:\n`) + all.map((m) => `  ${m}`).join('\n') + '\n');
        return { type: 'handled' };
      }

      state.model = args.join(' ');
      console.log(chalk.white(`Modelo alterado para: ${chalk.bold(state.model)}`));
      return { type: 'handled' };
    }

    case '/provider': {
      if (!args.length) {
        console.log(chalk.white(`Provider atual: ${chalk.bold(state.provider)}`));
        return { type: 'handled' };
      }

      if (args[0] === 'list') {
        console.log(chalk.white('\nProviders disponíveis:\n') +
          PROVIDERS.map((p) =>
            p === state.provider ? `  ${chalk.white.bold(`${p} ←`)}` : `  ${chalk.gray(p)}`
          ).join('\n') + '\n');
        return { type: 'handled' };
      }

      const newProvider = args[0] as ProviderName;
      if (!PROVIDERS.includes(newProvider)) {
        console.log(chalk.gray(`Provider inválido: ${newProvider}`));
        console.log(chalk.gray(`Disponíveis: ${PROVIDERS.join(', ')}`));
        return { type: 'handled' };
      }

      state.provider = newProvider;
      const defaultModel = BUILTIN_MODELS[newProvider]?.[0] ?? state.model;
      state.model = defaultModel;
      console.log(chalk.white(`Provider: ${chalk.bold(state.provider)} | Modelo: ${chalk.bold(state.model)}`));
      return { type: 'handled' };
    }

    case '/add': {
      if (args.length < 2) {
        console.log(chalk.gray('Uso: /add <provider> <model>'));
        return { type: 'handled' };
      }
      const [provider, ...modelParts] = args;
      const model = modelParts.join(' ');
      state.customModels.push({ provider: provider as ProviderName, model });
      console.log(chalk.white(`Modelo ${chalk.bold(model)} adicionado ao provider ${chalk.bold(provider)}`));
      return { type: 'handled' };
    }

    case '/system': {
      if (!args.length) {
        console.log(chalk.gray('Uso: /system <prompt> ou /system show'));
        return { type: 'handled' };
      }
      if (args[0] === 'show') {
        console.log(chalk.white(`\nSystem prompt:\n${chalk.gray(state.systemPrompt)}\n`));
        return { type: 'handled' };
      }
      state.systemPrompt = args.join(' ');
      console.log(chalk.white(`System prompt atualizado.`));
      return { type: 'handled' };
    }

    case '/history': {
      if (!state.history.length) {
        console.log(chalk.gray('Histórico vazio.'));
        return { type: 'handled' };
      }
      for (const msg of state.history) {
        const label = msg.role === 'user' ? chalk.white.bold('Você') : chalk.gray('CoreCode');
        console.log(`${label}: ${msg.content.slice(0, 120)}${msg.content.length > 120 ? '...' : ''}`);
      }
      console.log('');
      return { type: 'handled' };
    }

    case '/clear': {
      state.history.length = 0;
      console.log(chalk.gray('Histórico limpo.'));
      return { type: 'handled' };
    }

    case '/exit':
    case '/quit': {
      return { type: 'exit' };
    }

    default:
      return { type: 'unknown' };
  }
}
