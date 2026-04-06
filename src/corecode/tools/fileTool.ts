import fs from 'fs/promises';
import path from 'path';
import picomatch from 'picomatch';
import chalk from 'chalk';

export interface FileContext {
  path: string;
  content: string;
  size: number;
  truncated: boolean;
}

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_FILES = 20;

/**
 * Expand glob patterns to matching file paths.
 */
async function expandGlob(pattern: string, cwd: string): Promise<string[]> {
  const isGlob = pattern.includes('*') || pattern.includes('?') || pattern.includes('{');

  if (!isGlob) {
    // Direct file path
    try {
      const stat = await fs.stat(path.resolve(cwd, pattern));
      if (stat.isFile()) return [path.resolve(cwd, pattern)];
    } catch {
      return [];
    }
    return [];
  }

  // Walk directory and match
  const isMatch = picomatch(pattern);
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      // Skip common noise directories
      if (['node_modules', '.git', 'dist', '.next', 'build', 'coverage'].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const relative = path.relative(cwd, fullPath);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && isMatch(relative)) {
        results.push(fullPath);
      }
    }
  }

  await walk(cwd);
  return results;
}

/**
 * Read one or more files matched by patterns and return their content.
 */
export async function readFiles(
  patterns: string[],
  cwd: string = process.cwd()
): Promise<FileContext[]> {
  const allPaths: string[] = [];

  for (const pattern of patterns) {
    const matches = await expandGlob(pattern, cwd);
    allPaths.push(...matches);
  }

  // Deduplicate
  const unique = [...new Set(allPaths)];

  if (unique.length === 0) {
    return [];
  }

  const limited = unique.slice(0, MAX_FILES);
  const results: FileContext[] = [];

  for (const filePath of limited) {
    try {
      const stat = await fs.stat(filePath);
      let content: string;
      let truncated = false;

      if (stat.size > MAX_FILE_SIZE) {
        const buffer = Buffer.alloc(MAX_FILE_SIZE);
        const fd = await fs.open(filePath, 'r');
        await fd.read(buffer, 0, MAX_FILE_SIZE, 0);
        await fd.close();
        content = buffer.toString('utf-8');
        truncated = true;
      } else {
        content = await fs.readFile(filePath, 'utf-8');
      }

      results.push({
        path: path.relative(cwd, filePath),
        content,
        size: stat.size,
        truncated,
      });
    } catch {
      // Skip unreadable files
    }
  }

  return results;
}

/**
 * Format file contexts for injection into the AI system/user message.
 */
export function formatFileContexts(files: FileContext[]): string {
  if (files.length === 0) return '';

  const lines: string[] = ['--- FILE CONTEXT ---'];

  for (const file of files) {
    lines.push(`\n### ${file.path} (${formatSize(file.size)}${file.truncated ? ', truncated at 100KB' : ''})`);
    lines.push('```');
    lines.push(file.content);
    lines.push('```');
  }

  lines.push('\n--- END FILE CONTEXT ---');
  return lines.join('\n');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Detect @filename or file mentions in user input.
 * Returns list of patterns to read.
 */
export function detectFileReferences(input: string): string[] {
  const patterns: string[] = [];

  // Explicit @file syntax: @src/index.ts or @src/**/*.ts
  const atMatches = input.matchAll(/@([\w./\\*{}[\]?!-]+)/g);
  for (const match of atMatches) {
    patterns.push(match[1]);
  }

  // Natural language file mentions: "the file src/index.ts" or "in package.json"
  const filePattern = /(?:file|arquivo|read|open|look at|analise|analyze|check)\s+([a-zA-Z0-9_./\\-]+\.[a-zA-Z]{1,6})/gi;
  const fileMatches = input.matchAll(filePattern);
  for (const match of fileMatches) {
    const candidate = match[1];
    // Don't add duplicates
    if (!patterns.includes(candidate)) {
      patterns.push(candidate);
    }
  }

  // Bare filename mention: "package.json" as first word or quoted
  const quotedFile = input.match(/["']([a-zA-Z0-9_./\\-]+\.[a-zA-Z]{1,6})["']/);
  if (quotedFile && !patterns.includes(quotedFile[1])) {
    patterns.push(quotedFile[1]);
  }

  return patterns;
}

/**
 * Print file context summary to terminal.
 */
export function printFileContextSummary(files: FileContext[]): void {
  if (files.length === 0) return;
  const DIM = chalk.dim;
  const ORANGE = chalk.hex('#E8955A');

  console.log(` ${ORANGE('◆')} ${DIM('context:')} ${files.map(f => chalk.white(f.path)).join(DIM(', '))}\n`);
}
