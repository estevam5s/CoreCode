import figlet from 'figlet';
import chalk from 'chalk';
import boxen from 'boxen';

export function showCoreCodeBanner() {
  const title = figlet.textSync('CoreCode', {
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  const subtitle = 'ADVANCED MULTI-MODEL AI CLI';

  const content =
    chalk.white.bold(title) +
    '\n' +
    chalk.gray('============================================================') +
    '\n' +
    chalk.white.bold(subtitle) +
    '\n' +
    chalk.gray('============================================================');

  console.log(
    boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'white'
    })
  );
}
