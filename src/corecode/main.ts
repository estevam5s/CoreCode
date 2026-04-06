import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { showCoreCodeBanner } from './banner.js';
import { showCoreCodeWelcome } from './welcome.js';
import { createState } from './state.js';
import { startRepl } from './repl.js';
import { hasAnyKey, runSetupWizard } from './setup-wizard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// resolve .env next to the binary (../../../.env relative to dist/cli.mjs)
const envPath = path.resolve(__dirname, '..', '..', '.env');

config({ path: envPath });

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log('CoreCode v0.1.7');
    process.exit(0);
  }

  showCoreCodeBanner();

  // first-run wizard if no keys are configured
  if (!hasAnyKey()) {
    await runSetupWizard(envPath);
    // reload env after wizard
    config({ path: envPath, override: true });
  }

  const state = createState();
  showCoreCodeWelcome();

  await startRepl(state);
}

void main();
