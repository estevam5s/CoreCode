import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { showCoreCodeBanner } from './banner.js';
import { showCoreCodeWelcome } from './welcome.js';
import { createState } from './state.js';
import { startRepl } from './repl.js';
import { hasAnyKey, runSetupWizard } from './setup-wizard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// dist/cli.mjs lives in dist/ — .env is one level up at CoreCode/.env
const envPath = path.resolve(__dirname, '..', '.env');

config({ path: envPath });

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    console.log('CoreCode v0.1.7');
    process.exit(0);
  }

  showCoreCodeBanner();

  // skip wizard if mock provider is set (no key needed) or any real key exists
  const isMock = (process.env.CORECODE_DEFAULT_PROVIDER || '') === 'mock';
  if (!isMock && !hasAnyKey()) {
    await runSetupWizard(envPath);
    config({ path: envPath, override: true });
  }

  const state = createState();
  showCoreCodeWelcome(state.provider, state.model);

  await startRepl(state);
}

void main();
