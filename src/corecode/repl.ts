import readline from 'readline';
import chalk from 'chalk';
import type { CoreState } from './state.js';
import { handleCommand, SLASH_COMMANDS } from './commands.js';
import { showExitMenu, handleExitAction } from './exit-menu.js';
import { streamResponse } from './router.js';
import { getMissingKeyMessage } from './setup-wizard.js';
import { detectFileReferences, readFiles, formatFileContexts, printFileContextSummary } from './tools/fileTool.js';
import { runBashTool } from './tools/bashTool.js';
import { webSearch, printSearchResults, formatSearchContext } from './tools/webSearch.js';
import { processDiffsFromResponse } from './tools/diffTool.js';
import { Spinner } from './spinner.js';
import { renderResponse } from './highlighter.js';

const ORANGE = chalk.hex('#E8955A');

// ANSI escape codes
const CLEAR_LINE = '\x1b[1A\x1b[2K';
const SAVE_CURSOR = '\x1b[s';
const RESTORE_CURSOR = '\x1b[u';
const CLEAR_TO_EOL = '\x1b[K';
const MOVE_UP = (n: number) => `\x1b[${n}A`;
const MOVE_DOWN = (n: number) => `\x1b[${n}B`;

const MAX_DROPDOWN_ITEMS = 12;

function renderUserInput(text: string): string {
  const cols = process.stdout.columns || 80;
  const line = ` ${chalk.white('>')} ${chalk.white(text)}`;
  const visLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
  const pad = Math.max(0, cols - visLen);
  return chalk.bgHex('#1e1e2e')(line + ' '.repeat(pad));
}

function getToolsIndicator(state: CoreState): string {
  const tools = ['file', 'bash', 'search'];
  return `${ORANGE('●')} ${chalk.dim(state.provider + '/' + state.model.split(':')[0])} ${chalk.dim('·')} ${chalk.dim('tools:')} ${chalk.dim(tools.join(' '))}`;
}

function printStatusBar(state: CoreState): void {
  const cols = process.stdout.columns || 80;
  const inner = cols - 4;

  const providerTag = ORANGE(state.provider);
  const modelTag    = chalk.white(state.model.split(':')[0].split('/').pop() ?? state.model);
  const modeTag     = chalk.dim(state.mode ?? 'code');
  const msgCount    = state.history.length;
  const tokens      = state.sessionStats?.estimatedTokens ?? 0;

  const left  = ` ${ORANGE('◆')} CoreCode  ${chalk.dim('·')}  ${providerTag}  ${chalk.dim('/')}  ${modelTag}  ${chalk.dim('·')}  ${modeTag}`;
  const right  = chalk.dim(`msgs:${msgCount}  ~${tokens}tk`);

  const leftVis  = left.replace(/\x1b\[[0-9;]*m/g, '').length;
  const rightVis = right.replace(/\x1b\[[0-9;]*m/g, '').length;
  const gap      = Math.max(1, inner - leftVis - rightVis);

  const bar = chalk.bgHex('#0d0d1a')(' ' + left + ' '.repeat(gap) + right + ' ');
  const divider = chalk.dim(' ' + '─'.repeat(Math.max(0, cols - 2)));

  console.log('');
  console.log(bar);
  console.log(divider);
  console.log('');
}

// ── Autocomplete dropdown renderer ───────────────────────────────────────────

interface DropdownState {
  items: Array<{ name: string; desc: string }>;
  selectedIndex: number;
  visible: boolean;
  renderedLines: number;
}

function filterCommands(prefix: string): Array<{ name: string; desc: string }> {
  const lower = prefix.toLowerCase();
  return SLASH_COMMANDS
    .filter((c) => c.name.startsWith(lower))
    .slice(0, MAX_DROPDOWN_ITEMS);
}

function vis(s: string): number {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length;
}

function renderDropdown(buffer: string, dropdown: DropdownState): void {
  const cols = process.stdout.columns || 100;
  const nameCol = 26; // fixed width for command name column

  // Clear old lines first (if re-rendering)
  if (dropdown.renderedLines > 0) {
    for (let i = 0; i < dropdown.renderedLines; i++) {
      process.stdout.write(`\r\n${CLEAR_TO_EOL}`);
    }
    process.stdout.write(MOVE_UP(dropdown.renderedLines));
  }

  // Render each item on its own line below prompt
  const lines: string[] = [];
  for (let i = 0; i < dropdown.items.length; i++) {
    const item = dropdown.items[i];
    const isSelected = i === dropdown.selectedIndex;

    const rawName = item.name;
    const nameStr = isSelected
      ? chalk.hex('#7eb8f7').bold(rawName)
      : chalk.hex('#5577aa')(rawName);
    const namePad  = ' '.repeat(Math.max(1, nameCol - rawName.length));
    const descStr  = isSelected
      ? chalk.white(item.desc)
      : chalk.dim(item.desc);

    const full     = `  ${nameStr}${namePad}${descStr}`;
    const fullVis  = vis(full);
    const trailing = ' '.repeat(Math.max(0, cols - fullVis - 1));

    const row = isSelected
      ? chalk.bgHex('#1a1a2e')(full + trailing)
      : full + trailing;

    lines.push(row);
  }

  // Write all lines using \r\n (returns to col 0 on each line)
  for (const row of lines) {
    process.stdout.write(`\r\n${CLEAR_TO_EOL}${row}`);
  }

  dropdown.renderedLines = lines.length;

  // Move cursor back to the input line
  process.stdout.write(MOVE_UP(dropdown.renderedLines));

  // Rewrite prompt+buffer so cursor is at the right place
  process.stdout.write(`\r${CLEAR_TO_EOL}${chalk.dim('> ')}${buffer}`);
}

function clearDropdown(dropdown: DropdownState): void {
  if (!dropdown.visible || dropdown.renderedLines === 0) return;

  // Erase each dropdown line using \r\n
  for (let i = 0; i < dropdown.renderedLines; i++) {
    process.stdout.write(`\r\n${CLEAR_TO_EOL}`);
  }
  // Return to input line
  process.stdout.write(MOVE_UP(dropdown.renderedLines));

  dropdown.renderedLines = 0;
  dropdown.visible = false;
}

// ── Raw mode input with autocomplete ─────────────────────────────────────────

function readLineRaw(prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    const isTTY = process.stdin.isTTY;

    // Fallback: non-TTY mode (piped input)
    if (!isTTY) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
      process.stdout.write(prompt);
      rl.once('line', (line) => { rl.close(); resolve(line); });
      rl.once('close', () => resolve(null));
      return;
    }

    let buffer = '';
    const dropdown: DropdownState = {
      items: [],
      selectedIndex: 0,
      visible: false,
      renderedLines: 0,
    };

    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function cleanup(): void {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
    }

    function showDropdown(): void {
      if (!buffer.startsWith('/')) {
        if (dropdown.visible) clearDropdown(dropdown);
        return;
      }
      const matches = filterCommands(buffer);
      if (!matches.length) {
        if (dropdown.visible) clearDropdown(dropdown);
        dropdown.visible = false;
        return;
      }

      dropdown.items = matches;
      if (dropdown.selectedIndex >= matches.length) dropdown.selectedIndex = 0;
      dropdown.visible = true;
      renderDropdown(buffer, dropdown);
    }

    function acceptSelected(): void {
      if (!dropdown.visible || !dropdown.items.length) return;
      const selected = dropdown.items[dropdown.selectedIndex];
      clearDropdown(dropdown);
      buffer = selected.name + ' ';
      process.stdout.write(`\r${CLEAR_TO_EOL}${chalk.dim('> ')}${buffer}`);
      dropdown.visible = false;
    }

    function onData(key: string): void {
      // Ctrl-C → resolve with special sentinel for exit menu
      if (key === '\u0003') {
        cleanup();
        if (dropdown.visible) clearDropdown(dropdown);
        process.stdout.write('\n');
        resolve('\x03'); // sentinel: Ctrl+C
        return;
      }

      // Ctrl-D (EOF)
      if (key === '\u0004') {
        cleanup();
        if (dropdown.visible) clearDropdown(dropdown);
        process.stdout.write('\n');
        resolve(null);
        return;
      }

      // ESC
      if (key === '\x1b' || key === '\x1b\x1b') {
        if (dropdown.visible) {
          clearDropdown(dropdown);
          dropdown.visible = false;
        } else {
          buffer = '';
          process.stdout.write(`\r${CLEAR_TO_EOL}${chalk.dim('> ')}`);
        }
        return;
      }

      // Arrow keys: \x1b[A = up, \x1b[B = down, \x1b[C = right
      if (key === '\x1b[A') {
        // Arrow Up
        if (dropdown.visible && dropdown.items.length) {
          dropdown.selectedIndex = (dropdown.selectedIndex - 1 + dropdown.items.length) % dropdown.items.length;
          renderDropdown(buffer, dropdown);
        }
        return;
      }

      if (key === '\x1b[B') {
        // Arrow Down
        if (dropdown.visible && dropdown.items.length) {
          dropdown.selectedIndex = (dropdown.selectedIndex + 1) % dropdown.items.length;
          renderDropdown(buffer, dropdown);
        }
        return;
      }

      if (key === '\x1b[C') {
        // Arrow Right — accept selected
        if (dropdown.visible) {
          acceptSelected();
        }
        return;
      }

      // Tab — accept selected
      if (key === '\t') {
        if (dropdown.visible) {
          acceptSelected();
        } else if (buffer.startsWith('/')) {
          showDropdown();
        }
        return;
      }

      // Enter
      if (key === '\r' || key === '\n') {
        if (dropdown.visible) clearDropdown(dropdown);
        cleanup();
        process.stdout.write('\n');
        resolve(buffer);
        return;
      }

      // Backspace
      if (key === '\x7f' || key === '\b') {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          process.stdout.write(`\r${CLEAR_TO_EOL}${chalk.dim('> ')}${buffer}`);
          if (buffer.startsWith('/')) {
            showDropdown();
          } else if (dropdown.visible) {
            clearDropdown(dropdown);
            dropdown.visible = false;
          }
        }
        return;
      }

      // Ignore other escape sequences
      if (key.startsWith('\x1b')) return;

      // Regular printable character
      buffer += key;
      process.stdout.write(key);

      if (buffer.startsWith('/')) {
        showDropdown();
      } else if (dropdown.visible) {
        clearDropdown(dropdown);
        dropdown.visible = false;
      }
    }

    process.stdin.on('data', onData);
  });
}

// ── Exit flow ─────────────────────────────────────────────────────────────────

async function doExitFlow(state: CoreState): Promise<boolean> {
  const action = await showExitMenu(state);
  return handleExitAction(action, state);
}

// ── REPL entry point ─────────────────────────────────────────────────────────

export async function startRepl(state: CoreState): Promise<void> {
  const getPrompt = () => chalk.dim('> ');

  // Status bar at startup
  printStatusBar(state);

  while (true) {
    const line = await readLineRaw(getPrompt());

    // EOF (Ctrl+D or piped input ended)
    if (line === null) {
      console.log('');
      break;
    }

    // Ctrl+C → exit menu
    if (line === '\x03') {
      const shouldExit = await doExitFlow(state);
      if (shouldExit) process.exit(0);
      printStatusBar(state);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Redraw the user's input line with highlight
    process.stdout.write(CLEAR_LINE);
    console.log(renderUserInput(trimmed));
    console.log('');

    // ── BASH TOOL: detect !command ──────────────────────────────────────────
    if (trimmed.startsWith('!')) {
      try {
        const output = await runBashTool(trimmed);
        state.history.push({ role: 'user', content: trimmed });
        state.history.push({ role: 'assistant', content: output });
        if (state.history.length > 40) {
          state.history.splice(0, state.history.length - 40);
        }
      } catch (err) {
        console.log(chalk.dim(`  Bash error: ${(err as Error).message}\n`));
      }
      continue;
    }

    // ── SLASH COMMANDS ───────────────────────────────────────────────────────
    if (trimmed.startsWith('/')) {

      // Exit commands → exit menu
      if (trimmed === '/exit' || trimmed === '/quit' || trimmed === '/sair') {
        const shouldExit = await doExitFlow(state);
        if (shouldExit) process.exit(0);
        printStatusBar(state);
        continue;
      }

      // WEB SEARCH: /search <query>
      if (trimmed.startsWith('/search ')) {
        const query = trimmed.slice('/search '.length).trim();
        if (!query) {
          console.log(` ${chalk.dim('uso: /search <consulta>')}\n`);
          continue;
        }

        try {
          const results = await webSearch(query);
          printSearchResults(query, results);

          const context = formatSearchContext(query, results);
          state.history.push({ role: 'user', content: `/search ${query}` });
          state.history.push({ role: 'assistant', content: context });
        } catch (err) {
          console.log(` ${chalk.dim('Erro na busca: ' + (err as Error).message)}\n`);
        }
        continue;
      }

      const result = await handleCommand(trimmed, state);
      if (result.type === 'exit') {
        const shouldExit = await doExitFlow(state);
        if (shouldExit) process.exit(0);
        printStatusBar(state);
        continue;
      }
      if (result.type === 'retry') {
        if (state.lastUserMessage) {
          if (state.history.length >= 2) state.history.splice(-2, 2);
          const retryMsg = state.lastUserMessage;
          console.log(renderUserInput(retryMsg));
          console.log('');
          await sendToAI(state, retryMsg);
        }
        continue;
      }
      if (result.type === 'unknown') {
        console.log(` ${chalk.dim(`Comando desconhecido: ${trimmed} — digite /help`)}\n`);
      }
      continue;
    }

    // ── FILE TOOL: detect file references ───────────────────────────────────
    let extraContext = '';
    const filePatterns = detectFileReferences(trimmed);
    if (filePatterns.length > 0) {
      try {
        const files = await readFiles(filePatterns);
        if (files.length > 0) {
          printFileContextSummary(files);
          extraContext = formatFileContexts(files);
        }
      } catch {
        // ignore file read errors
      }
    }

    // ── AI RESPONSE ──────────────────────────────────────────────────────────
    const userMessage = extraContext ? `${extraContext}\n\nUser question: ${trimmed}` : trimmed;
    state.lastUserMessage = trimmed;

    // Prepend pinned message if set
    const finalMessage = state.pinnedMessage
      ? `[Pinned context: ${state.pinnedMessage}]\n\n${userMessage}`
      : userMessage;

    await sendToAI(state, finalMessage);
  }
}

async function sendToAI(state: CoreState, userMessage: string): Promise<void> {
  const spinner = new Spinner();
  spinner.start();

  let fullResponse = '';

  try {
    for await (const chunk of streamResponse(state, userMessage)) {
      fullResponse += chunk;
    }

    spinner.stop();

    if (state.debugMode) {
      console.log(chalk.dim(`\n [debug] raw response length: ${fullResponse.length} chars\n`));
    }

    if (fullResponse.trim()) {
      process.stdout.write(` ${ORANGE('●')}`);
      console.log(renderResponse(fullResponse));
      console.log('');
    }

    state.lastResponse = fullResponse;
    state.history.push({ role: 'user', content: userMessage });
    state.history.push({ role: 'assistant', content: fullResponse });
    state.sessionStats.messageCount += 2;
    state.sessionStats.estimatedTokens += Math.ceil((userMessage.length + fullResponse.length) / 4);
    if (state.history.length > 40) state.history.splice(0, state.history.length - 40);

    // ── DIFF TOOL ──────────────────────────────────────────────────────────
    if (fullResponse.includes('// FILE:') || fullResponse.includes('**`')) {
      await processDiffsFromResponse(fullResponse);
      state.lastDiff = fullResponse;
    }

  } catch (err: unknown) {
    spinner.stop();
    const msg = (err as Error).message;
    console.log('');
    if (msg.includes('401') || msg.includes('API key') || msg.includes('api key')) {
      console.log(chalk.dim('─────────────────────────────────────────────'));
      console.log(getMissingKeyMessage(state.provider));
      console.log(chalk.dim('─────────────────────────────────────────────\n'));
    } else if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      console.log(chalk.dim(`  No connection to ${state.provider}. Check the service.\n`));
    } else {
      console.log(chalk.dim(`  Error: ${msg}\n`));
    }
  }
}
