import chalk from 'chalk';

// Orange gradient: lighter top → darker bottom, matching the retro pixel style
const O1 = chalk.hex('#F0A070'); // top highlight
const O2 = chalk.hex('#E8955A'); // mid
const O3 = chalk.hex('#D4603A'); // darker
const O4 = chalk.hex('#B84A28'); // shadow/base

function paint(lines: string[]): string {
  const colors = [O1, O1, O2, O2, O3, O4];
  return lines.map((l, i) => (colors[i] ?? O4)(l)).join('\n');
}

// ─── CORE ─────────────────────────────────────────────────────────────────────
const CORE = [
  ' ██████╗  ██████╗ ██████╗  ███████╗',
  '██╔════╝ ██╔═══██╗██╔══██╗ ██╔════╝',
  '██║      ██║   ██║██████╔╝ █████╗  ',
  '██║      ██║   ██║██╔══██╗ ██╔══╝  ',
  '╚██████╗ ╚██████╔╝██║  ██╗ ███████╗',
  ' ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚══════╝',
];

// ─── CODE ─────────────────────────────────────────────────────────────────────
const CODE = [
  ' ██████╗  ██████╗ ██████╗  ███████╗',
  '██╔════╝ ██╔═══██╗██╔══██╗ ██╔════╝',
  '██║      ██║   ██║██║  ██║ █████╗  ',
  '██║      ██║   ██║██║  ██║ ██╔══╝  ',
  '╚██████╗ ╚██████╔╝██████╔╝ ███████╗',
  ' ╚═════╝  ╚═════╝ ╚═════╝  ╚══════╝',
];

export function showCoreCodeBanner() {
  console.log('');
  console.log(paint(CORE));
  console.log(paint(CODE));
  console.log('');
  const plus = chalk.dim('+');
  const tagline = chalk.dim('Any model. Every tool. Zero limits.');
  console.log(` ${plus} ${tagline} ${plus}`);
  console.log('');
}
