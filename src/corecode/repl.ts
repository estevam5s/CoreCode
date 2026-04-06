import readline from 'readline';
import chalk from 'chalk';
import type { CoreState } from './state.js';
import { handleCommand } from './commands.js';
import { streamResponse } from './router.js';
import { getMissingKeyMessage } from './setup-wizard.js';

function prompt(state: CoreState): string {
  return chalk.white.bold(`[${state.provider}/${state.model}]`) + chalk.white(' › ');
}

export async function startRepl(state: CoreState): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: '',
  });

  console.log(chalk.gray('Digite sua mensagem ou /help para ver os comandos.\n'));

  const askLine = (): Promise<string | null> =>
    new Promise((resolve) => {
      process.stdout.write(prompt(state));
      rl.once('line', (line) => resolve(line));
      rl.once('close', () => resolve(null));
    });

  rl.on('SIGINT', () => {
    console.log(chalk.gray('\nCtrl+C detectado. Use /exit para sair.'));
    process.stdout.write(prompt(state));
  });

  while (true) {
    const line = await askLine();

    if (line === null) {
      console.log(chalk.gray('\nTchau!'));
      break;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // slash commands
    if (trimmed.startsWith('/')) {
      const result = await handleCommand(trimmed, state);
      if (result.type === 'exit') {
        console.log(chalk.gray('Encerrando CoreCode. Até logo!'));
        rl.close();
        process.exit(0);
      }
      if (result.type === 'unknown') {
        console.log(chalk.gray(`Comando desconhecido: ${trimmed}. Use /help.`));
      }
      continue;
    }

    // send to model
    console.log('');
    process.stdout.write(chalk.gray('CoreCode: '));

    let fullResponse = '';

    try {
      for await (const chunk of streamResponse(state, trimmed)) {
        process.stdout.write(chalk.white(chunk));
        fullResponse += chunk;
      }
      console.log('\n');

      // save to history
      state.history.push({ role: 'user', content: trimmed });
      state.history.push({ role: 'assistant', content: fullResponse });

      // keep history bounded (last 40 messages)
      if (state.history.length > 40) {
        state.history.splice(0, state.history.length - 40);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message;
      console.log('');
      if (msg.includes('401') || msg.includes('API key') || msg.includes('api key')) {
        console.log(chalk.gray('─────────────────────────────────────────────'));
        console.log(getMissingKeyMessage(state.provider));
        console.log(chalk.gray('─────────────────────────────────────────────\n'));
      } else if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('connect')) {
        console.log(chalk.gray(`Sem conexão com ${state.provider}.`));
        console.log(chalk.gray('Verifique sua internet ou se o serviço local está rodando.\n'));
      } else {
        console.log(chalk.gray(`Erro: ${msg}\n`));
      }
    }
  }
}
