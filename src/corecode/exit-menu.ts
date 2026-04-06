import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import type { CoreState } from './state.js';

const ORANGE = chalk.hex('#E8955A');
const DIM = chalk.dim;

const CLEAR_TO_EOL = '\x1b[K';
const MOVE_UP = (n: number) => `\x1b[${n}A`;

// ── Box drawing ───────────────────────────────────────────────────────────────

function box(lines: string[], width = 58): string[] {
  const top    = ` ┌${'─'.repeat(width)}┐`;
  const bottom = ` └${'─'.repeat(width)}┘`;
  const mid    = ` ├${'─'.repeat(width)}┤`;
  const row    = (text: string) => {
    const visible = text.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = Math.max(0, width - visible.length - 2);
    return ` │ ${text}${' '.repeat(pad)} │`;
  };
  return [top, ...lines.map((l, i) => (i === 1 ? mid : '') + (i === 1 ? row(l) : row(l))), bottom];
}

// ── Exit menu ─────────────────────────────────────────────────────────────────

export type ExitAction = 'quit' | 'summary' | 'save' | 'cancel';

interface MenuItem {
  key: string;
  label: string;
  hint: string;
  action: ExitAction;
}

const MENU_ITEMS: MenuItem[] = [
  { key: '1', label: 'Sair imediatamente',           hint: '/quit',   action: 'quit'    },
  { key: '2', label: 'Gerar resumo e sair',           hint: '/resumo', action: 'summary' },
  { key: '3', label: 'Salvar conversa e sair',        hint: '/salvar', action: 'save'    },
  { key: '4', label: 'Cancelar (continuar no CoreCode)', hint: '',    action: 'cancel'  },
];

const WIDTH = 58;

function renderMenu(selectedIdx: number): void {
  const title = chalk.hex('#8899bb')('O que você deseja fazer antes de sair?');
  const sep   = ' ├' + '─'.repeat(WIDTH) + '┤';

  process.stdout.write(` ┌${'─'.repeat(WIDTH)}┐\n`);
  process.stdout.write(` │ ${title}${' '.repeat(Math.max(0, WIDTH - 40 - 2))} │\n`);
  process.stdout.write(`${sep}\n`);

  for (let i = 0; i < MENU_ITEMS.length; i++) {
    const item = MENU_ITEMS[i];
    const isSelected = i === selectedIdx;
    const bullet = isSelected ? ORANGE('●') : DIM(' ');
    const num    = isSelected ? chalk.bold.white(item.key + '.') : DIM(item.key + '.');
    const lbl    = isSelected ? chalk.bold.white(item.label) : chalk.white(item.label);
    const hint   = item.hint ? DIM(' ' + item.hint) : '';
    const raw    = ` ${item.key}. ${item.label}${item.hint ? ' ' + item.hint : ''}`;
    const pad    = Math.max(0, WIDTH - raw.length - 1);

    if (isSelected) {
      // Highlighted row with dark background
      const content = ` ${bullet} ${num} ${lbl}${hint}${' '.repeat(pad)}`;
      process.stdout.write(chalk.bgHex('#2a2a4e')(` │${content} │`) + '\n');
    } else {
      process.stdout.write(` │  ${num} ${lbl}${hint}${' '.repeat(pad)} │\n`);
    }
  }

  process.stdout.write(` └${'─'.repeat(WIDTH)}┘\n`);
  process.stdout.write(DIM(`  ↑↓ navegar  ·  Enter selecionar  ·  1-4 tecla rápida\n`));
}

const MENU_LINES = MENU_ITEMS.length + 5; // top + title + sep + items + bottom + hint

function clearMenu(): void {
  for (let i = 0; i < MENU_LINES; i++) {
    process.stdout.write(`${CLEAR_TO_EOL}\n`);
  }
  process.stdout.write(MOVE_UP(MENU_LINES));
}

export async function showExitMenu(state: CoreState): Promise<ExitAction> {
  if (!process.stdin.isTTY) return 'quit';

  let selectedIdx = 0;

  console.log('');
  renderMenu(selectedIdx);

  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function cleanup() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onKey);
    }

    function redraw() {
      process.stdout.write(MOVE_UP(MENU_LINES));
      clearMenu();
      renderMenu(selectedIdx);
    }

    function onKey(key: string) {
      // Arrow Up
      if (key === '\x1b[A') {
        selectedIdx = (selectedIdx - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        redraw();
        return;
      }
      // Arrow Down
      if (key === '\x1b[B') {
        selectedIdx = (selectedIdx + 1) % MENU_ITEMS.length;
        redraw();
        return;
      }
      // Number keys 1-4
      if (key >= '1' && key <= '4') {
        selectedIdx = parseInt(key, 10) - 1;
        redraw();
        // Small delay so user sees the selection, then confirm
        setTimeout(() => {
          cleanup();
          process.stdout.write('\n');
          resolve(MENU_ITEMS[selectedIdx].action);
        }, 120);
        return;
      }
      // Enter
      if (key === '\r' || key === '\n') {
        cleanup();
        process.stdout.write('\n');
        resolve(MENU_ITEMS[selectedIdx].action);
        return;
      }
      // ESC or Ctrl+C → cancel
      if (key === '\x1b' || key === '\x1b\x1b' || key === '\u0003') {
        cleanup();
        process.stdout.write('\n');
        resolve('cancel');
        return;
      }
    }

    process.stdin.on('data', onKey);
  });
}

// ── Post-exit actions ─────────────────────────────────────────────────────────

export async function handleExitAction(action: ExitAction, state: CoreState): Promise<boolean> {
  if (action === 'cancel') {
    console.log(` ${DIM('Continuando… Digite /help para ver os comandos.')}\n`);
    return false; // don't exit
  }

  if (action === 'summary') {
    console.log(`\n ${ORANGE('●')} ${chalk.white('Resumo da sessão')}\n`);
    if (!state.history.length) {
      console.log(` ${DIM('Nenhuma conversa para resumir.')}\n`);
    } else {
      const msgs = state.history.length;
      const dur = Math.round((Date.now() - (state.startTime ?? Date.now())) / 60000);
      console.log(` ${DIM('Mensagens:')}  ${chalk.white(msgs)}`);
      console.log(` ${DIM('Duração:')}    ${chalk.white(dur + ' min')}`);
      console.log(` ${DIM('Provider:')}   ${ORANGE(state.provider)}`);
      console.log(` ${DIM('Modelo:')}     ${chalk.white(state.model)}`);
      if (state.sessionStats) {
        console.log(` ${DIM('Tokens est:')} ${chalk.white('~' + state.sessionStats.estimatedTokens)}`);
      }
      console.log('');
      // Print last 3 exchanges as summary
      const recent = state.history.slice(-6);
      for (const msg of recent) {
        const who = msg.role === 'user' ? chalk.dim('você: ') : ORANGE('● ');
        const txt = msg.content.slice(0, 100) + (msg.content.length > 100 ? '…' : '');
        console.log(` ${who}${chalk.dim(txt)}`);
      }
    }
    console.log('');
  }

  if (action === 'save') {
    try {
      const defaultName = `corecode-${new Date().toISOString().slice(0, 10)}.md`;
      const filePath = path.join(process.cwd(), defaultName);
      const lines: string[] = [
        `# CoreCode — Conversa\n`,
        `**Provider:** ${state.provider}  `,
        `**Modelo:** ${state.model}  `,
        `**Data:** ${new Date().toLocaleString('pt-BR')}\n`,
        '---\n',
      ];
      for (const msg of state.history) {
        if (msg.role === 'user')      lines.push(`### Você\n${msg.content}\n`);
        else if (msg.role === 'assistant') lines.push(`### CoreCode\n${msg.content}\n`);
      }
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
      console.log(`\n ${ORANGE('●')} ${DIM('Conversa salva em')} ${chalk.white(filePath)}\n`);
    } catch (e) {
      console.log(` ${DIM('Erro ao salvar: ' + (e as Error).message)}\n`);
    }
  }

  // Goodbye message
  const farewells = [
    'Até logo! Bom código! 🚀',
    'Até mais! Foi ótimo trabalhar com você.',
    'Até a próxima! Continue codando.',
    'Tchau! Volte sempre que precisar.',
  ];
  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  console.log(` ${ORANGE('●')} ${chalk.dim(farewell)}\n`);
  return true; // exit
}
