/**
 * CoreCode — build script dedicado (REPL próprio, sem dependências OpenClaude)
 */
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const version = pkg.version;

const result = await Bun.build({
  entrypoints: ['./src/corecode/main.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  splitting: false,
  sourcemap: 'external',
  minify: false,
  naming: 'cli.mjs',
  external: ['readline', 'dotenv', 'chalk', 'boxen', 'ora'],
});

if (!result.success) {
  console.error('Build falhou:');
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log(`✓ CoreCode v${version} → dist/cli.mjs`);
