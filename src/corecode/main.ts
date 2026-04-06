import { config } from 'dotenv';
import { showCoreCodeBanner } from './banner.js';
import { showCoreCodeWelcome } from './welcome.js';
import { createState } from './state.js';
import { startRepl } from './repl.js';

// load .env
config();

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log('CoreCode v0.1.7');
    process.exit(0);
  }

  showCoreCodeBanner();
  const state = createState();
  showCoreCodeWelcome();

  await startRepl(state);
}

void main();
