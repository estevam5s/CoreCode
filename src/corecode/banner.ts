import chalk from 'chalk';
import boxen from 'boxen';

const ASCII_LOGO = `
  ██████╗ ██████╗ ██████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██║     ██║   ██║██████╔╝█████╗  ██║     ██║   ██║██║  ██║█████╗
 ██║     ██║   ██║██╔══██╗██╔══╝  ██║     ██║   ██║██║  ██║██╔══╝
 ╚██████╗╚██████╔╝██║  ██║███████╗╚██████╗╚██████╔╝██████╔╝███████╗
  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═════╝╚══════╝`;

export function showCoreCodeBanner() {
  const title = ASCII_LOGO;

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
