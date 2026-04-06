import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';

const ORANGE = chalk.hex('#E8955A');
const DIM = chalk.dim;
const GREEN = chalk.green;
const RED = chalk.red;

export interface FileDiff {
  filePath: string;
  newContent: string;
  oldContent?: string;
}

/**
 * Parse code blocks from AI response.
 * Looks for comments like `// FILE: path/to/file` before code blocks.
 */
export function parseFileDiffs(response: string): FileDiff[] {
  const diffs: FileDiff[] = [];

  // Pattern: // FILE: <path>\n```<lang>\n<content>\n```
  const blockPattern = /\/\/\s*FILE:\s*([^\n]+)\n```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(response)) !== null) {
    const filePath = match[1].trim();
    const newContent = match[2];
    diffs.push({ filePath, newContent });
  }

  // Also look for markdown-style "**`path`**" followed by code blocks
  const altPattern = /\*\*`([^`]+)`\*\*\s*\n```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
  while ((match = altPattern.exec(response)) !== null) {
    const filePath = match[1].trim();
    // Avoid duplicates
    if (!diffs.some((d) => d.filePath === filePath)) {
      const newContent = match[2];
      diffs.push({ filePath, newContent });
    }
  }

  return diffs;
}

/**
 * Generate a simple line-by-line diff between old and new content.
 */
function generateSimpleDiff(oldContent: string, newContent: string): string[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const output: string[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      // Addition
      output.push(GREEN(`+ ${newLine}`));
    } else if (newLine === undefined) {
      // Removal
      output.push(RED(`- ${oldLine}`));
    } else if (oldLine !== newLine) {
      output.push(RED(`- ${oldLine}`));
      output.push(GREEN(`+ ${newLine}`));
    } else {
      output.push(DIM(`  ${oldLine}`));
    }
  }

  return output;
}

/**
 * Show a colorized diff in the terminal and ask for confirmation.
 */
export async function showAndConfirmDiff(diff: FileDiff, cwd: string = process.cwd()): Promise<boolean> {
  const fullPath = path.isAbsolute(diff.filePath)
    ? diff.filePath
    : path.resolve(cwd, diff.filePath);

  // Try to read existing file for comparison
  let oldContent = '';
  let isNewFile = false;

  try {
    oldContent = await fs.readFile(fullPath, 'utf-8');
  } catch {
    isNewFile = true;
  }

  console.log(`\n ${ORANGE('◆')} ${chalk.white(diff.filePath)} ${isNewFile ? DIM('(new file)') : DIM('(modified)')}\n`);

  // Show diff
  if (isNewFile) {
    const lines = diff.newContent.split('\n').slice(0, 40);
    for (const line of lines) {
      console.log(GREEN(`+ ${line}`));
    }
    if (diff.newContent.split('\n').length > 40) {
      console.log(DIM(`  ... (${diff.newContent.split('\n').length - 40} more lines)`));
    }
  } else {
    const diffLines = generateSimpleDiff(oldContent, diff.newContent);
    const preview = diffLines.slice(0, 50);
    for (const line of preview) {
      console.log(line);
    }
    if (diffLines.length > 50) {
      console.log(DIM(`  ... (${diffLines.length - 50} more diff lines)`));
    }
  }

  console.log('');

  // Ask for confirmation
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(` ${DIM('Apply this diff?')} ${chalk.white('[y/N]')} `);
    rl.once('line', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * Write a file to disk after diff confirmation.
 */
export async function applyDiff(diff: FileDiff, cwd: string = process.cwd()): Promise<void> {
  const fullPath = path.isAbsolute(diff.filePath)
    ? diff.filePath
    : path.resolve(cwd, diff.filePath);

  // Ensure directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, diff.newContent, 'utf-8');

  console.log(` ${ORANGE('●')} ${DIM('Written:')} ${chalk.white(diff.filePath)}\n`);
}

/**
 * Process all diffs found in an AI response: show each one, ask for confirmation, apply.
 */
export async function processDiffsFromResponse(response: string, cwd: string = process.cwd()): Promise<void> {
  const diffs = parseFileDiffs(response);

  if (diffs.length === 0) return;

  console.log(`\n ${ORANGE('◆')} ${DIM(`Found ${diffs.length} file change${diffs.length > 1 ? 's' : ''} in response`)}\n`);

  for (const diff of diffs) {
    const confirmed = await showAndConfirmDiff(diff, cwd);
    if (confirmed) {
      await applyDiff(diff, cwd);
    } else {
      console.log(` ${DIM('Skipped: ' + diff.filePath)}\n`);
    }
  }
}
