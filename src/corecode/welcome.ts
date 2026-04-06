import chalk from 'chalk';

export function showCoreCodeWelcome(provider?: string, model?: string) {
  const p = provider || process.env.CORECODE_DEFAULT_PROVIDER || 'mock';
  const m = model || process.env.CORECODE_DEFAULT_MODEL || '—';

  console.log(chalk.white(`Provider: ${chalk.bold(p)}`));
  console.log(chalk.white(`Model:    ${chalk.bold(m)}`));
  console.log(chalk.gray('Modo:     Advanced CLI Agent'));
  console.log(chalk.gray('Tipo /help para ver os comandos.\n'));
}
