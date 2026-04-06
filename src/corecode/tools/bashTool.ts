import { execFile } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';

const ORANGE = chalk.hex('#E8955A');
const DIM = chalk.dim;

const TIMEOUT_MS = 30_000;

/** Commands that are unconditionally blocked */
const BLOCKLIST: RegExp[] = [
  /rm\s+-rf\s+\//,
  /rm\s+--recursive.*\//,
  /sudo\s+rm/,
  /mkfs/,
  /dd\s+if=/,
  /:\s*\(\s*\)\s*\{.*\}\s*;/,  // fork bomb
  />\s*\/dev\/sda/,
  /chmod\s+-R\s+777\s+\//,
  /chown\s+-R.*\//,
  /shutdown/,
  /reboot/,
  /halt/,
  /poweroff/,
];

export interface CommandResult {
  stdout: string;
  stderr: string;
  code: number;
}

/**
 * Check if a command is in the blocklist.
 */
function isBlocked(cmd: string): boolean {
  return BLOCKLIST.some((pattern) => pattern.test(cmd));
}

/**
 * Ask for user confirmation before executing a command.
 */
async function confirm(cmd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(`\n ${ORANGE('!')} Execute: ${chalk.white(cmd)}\n`);
    process.stdout.write(` ${DIM('Run this command? [y/N]')} `);

    rl.once('line', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * Execute a shell command with timeout and blocklist checking.
 */
export async function executeCommand(cmd: string): Promise<CommandResult> {
  // Remove leading ! if present
  const command = cmd.startsWith('!') ? cmd.slice(1).trim() : cmd.trim();

  if (!command) {
    return { stdout: '', stderr: 'Empty command', code: 1 };
  }

  // Blocklist check
  if (isBlocked(command)) {
    const msg = `Command blocked for safety: ${command}`;
    console.log(`\n ${chalk.red('✗')} ${DIM(msg)}\n`);
    return { stdout: '', stderr: msg, code: 1 };
  }

  return new Promise((resolve) => {
    const child = execFile(
      'bash',
      ['-c', command],
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || (error?.message ?? ''),
          code: error?.code != null ? Number(error.code) : 0,
        });
      }
    );

    // Pipe output in real time
    child.stdout?.on('data', (chunk: Buffer) => {
      process.stdout.write(chalk.dim(chunk.toString()));
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      process.stderr.write(chalk.dim(chunk.toString()));
    });
  });
}

/**
 * High-level bash tool: show command, ask for confirmation, run, return output.
 */
export async function runBashTool(cmd: string): Promise<string> {
  const command = cmd.startsWith('!') ? cmd.slice(1).trim() : cmd.trim();

  if (isBlocked(command)) {
    return `[BLOCKED] This command is not allowed for safety reasons: ${command}`;
  }

  const ok = await confirm(command);
  if (!ok) {
    console.log(` ${DIM('Cancelled.')}\n`);
    return '[CANCELLED] User declined to run the command.';
  }

  console.log(` ${ORANGE('●')} ${DIM('Running...')}\n`);

  const result = await executeCommand(command);
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n');

  console.log('');

  // Return formatted context for the AI
  const lines = [`[BASH OUTPUT] $ ${command}`, output || '(no output)', `Exit code: ${result.code}`];
  return lines.join('\n');
}

/**
 * Format bash result for injection into AI context.
 */
export function formatBashContext(cmd: string, result: CommandResult): string {
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 8000);
  return `--- BASH OUTPUT ---\n$ ${cmd}\n${output}\nExit: ${result.code}\n--- END BASH OUTPUT ---`;
}
