import chalk from 'chalk';

const ORANGE = chalk.hex('#E8955A');

// Words that rotate while loading — same playful style as OpenClaude
const LOADING_WORDS = [
  'Wibbling',
  'Wrangling',
  'Thinking',
  'Pondering',
  'Reasoning',
  'Analyzing',
  'Computing',
  'Synthesizing',
  'Cogitating',
  'Deliberating',
  'Ruminating',
  'Calculating',
  'Devising',
  'Contemplating',
  'Processing',
  'Crunching',
  'Assembling',
  'Orchestrating',
];

const TIPS = [
  'Use /model list to see available models for the current provider',
  'Switch providers in real-time with /provider groq | openai | ollama',
  'Run shell commands with !<command> — confirmation required',
  'Search the web with /search <query>',
  'Read files with @path/to/file or mention them in your message',
  'Set a custom system prompt with /system <your prompt>',
  'Clear conversation history with /clear',
  'Use /status to see provider, model and history count',
  'Add custom models with /add <provider> <model-name>',
  'Groq is free — get your key at console.groq.com',
  'Ollama runs 100% locally — no internet after download',
  'Use /history to review the conversation so far',
  'Use /provider list to see which providers are free',
  'Prefix a message with @src/**/*.ts to load all TypeScript files',
  'CoreCode is open source — github.com/estevam5s/CoreCode',
];

export class Spinner {
  private timer: ReturnType<typeof setInterval> | null = null;
  private wordTimer: ReturnType<typeof setInterval> | null = null;
  private dotCount = 1;
  private wordIndex: number;
  private tip: string;
  private linesWritten = 0;

  constructor() {
    this.wordIndex = Math.floor(Math.random() * LOADING_WORDS.length);
    this.tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  }

  private get word() {
    return LOADING_WORDS[this.wordIndex % LOADING_WORDS.length];
  }

  private renderLines(): string[] {
    const dots = '.'.repeat(this.dotCount);
    const spaces = ' '.repeat(3 - this.dotCount); // keep width stable
    const line1 = ` ${ORANGE('*')} ${ORANGE(this.word + dots + spaces)}`;
    const line2 = `   ${chalk.dim('└─')} ${chalk.dim('Tip: ' + this.tip)}`;
    return [line1, line2];
  }

  private clearWritten() {
    for (let i = 0; i < this.linesWritten; i++) {
      process.stdout.write('\x1b[1A\x1b[2K'); // move up + clear line
    }
    this.linesWritten = 0;
  }

  private paint() {
    this.clearWritten();
    const lines = this.renderLines();
    // write a blank line before spinner
    process.stdout.write('\n');
    for (const l of lines) {
      process.stdout.write(l + '\n');
    }
    this.linesWritten = lines.length + 1; // +1 for the blank line
  }

  start() {
    this.dotCount = 1;
    this.paint();

    // animate dots
    this.timer = setInterval(() => {
      this.dotCount = (this.dotCount % 3) + 1;
      this.paint();
    }, 200);

    // rotate word every 2.5s
    this.wordTimer = setInterval(() => {
      this.wordIndex++;
      this.tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    }, 2500);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.wordTimer) { clearInterval(this.wordTimer); this.wordTimer = null; }
    this.clearWritten();
  }
}
