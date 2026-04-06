import chalk from 'chalk';
import { resolveDefaultModel, resolveDefaultProvider } from './providerResolver.js';

export function showCoreCodeWelcome() {
  const provider = resolveDefaultProvider();
  const model = resolveDefaultModel();

  console.log(chalk.white(`Provider: ${provider}`));
  console.log(chalk.white(`Model:    ${model}`));
  console.log(chalk.gray('Modo:     Advanced CLI Agent'));
  console.log(chalk.gray('Tema:     Preto e branco'));
  console.log('');
}
