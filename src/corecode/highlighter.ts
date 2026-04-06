import chalk from 'chalk';

// ── Palette (VS Code Dark+ inspired) ──────────────────────────────────────────
const K  = chalk.hex('#569CD6');   // keywords: const, function, let, return...
const KW = chalk.hex('#C586C0');   // control flow: if, else, for, while, class...
const ST = chalk.hex('#CE9178');   // strings: 'hello', "world", `template`
const CM = chalk.hex('#6A9955');   // comments: // ... /* ... */
const NM = chalk.hex('#B5CEA8');   // numbers: 42, 3.14
const FN = chalk.hex('#DCDCAA');   // function names / calls
const TY = chalk.hex('#4EC9B0');   // types / classes
const OP = chalk.hex('#D4D4D4');   // operators and punctuation
const BI = chalk.hex('#9CDCFE');   // built-ins / identifiers
const WH = chalk.hex('#D4D4D4');   // default white text

// ── Language keyword maps ──────────────────────────────────────────────────────
const JS_KEYWORDS   = new Set(['const','let','var','function','return','async','await','export','import','from','default','class','extends','new','this','typeof','instanceof','void','delete','in','of','yield','static','get','set','throw','try','catch','finally','if','else','switch','case','break','continue','for','while','do','true','false','null','undefined','NaN','Infinity','require','module']);
const TS_EXTRAS     = new Set(['type','interface','enum','namespace','declare','abstract','implements','readonly','private','public','protected','as','satisfies','keyof','infer','never','unknown','any','string','number','boolean','object','symbol','bigint','void']);
const PY_KEYWORDS   = new Set(['def','class','return','import','from','as','if','elif','else','for','while','in','not','and','or','is','lambda','with','try','except','finally','raise','pass','break','continue','True','False','None','yield','async','await','print','len','range','type','self','super']);
const BASH_KEYWORDS = new Set(['if','then','else','elif','fi','for','do','done','while','case','esac','function','return','export','local','echo','cd','ls','mkdir','rm','mv','cp','cat','grep','sed','awk','curl','set','source','exit']);
const GO_KEYWORDS   = new Set(['func','var','const','type','struct','interface','return','if','else','for','range','switch','case','default','break','continue','go','chan','select','defer','package','import','make','new','len','cap','append','copy','delete','close','panic','recover','nil','true','false','iota']);
const RUST_KEYWORDS = new Set(['fn','let','mut','const','struct','enum','impl','trait','pub','use','mod','return','if','else','match','for','while','loop','break','continue','async','await','move','ref','where','type','dyn','Box','Vec','String','Option','Result','Some','None','Ok','Err','true','false']);

const LANG_KW: Record<string, Set<string>> = {
  js: JS_KEYWORDS,
  ts: new Set([...JS_KEYWORDS, ...TS_EXTRAS]),
  jsx: JS_KEYWORDS,
  tsx: new Set([...JS_KEYWORDS, ...TS_EXTRAS]),
  javascript: JS_KEYWORDS,
  typescript: new Set([...JS_KEYWORDS, ...TS_EXTRAS]),
  python: PY_KEYWORDS,
  py: PY_KEYWORDS,
  bash: BASH_KEYWORDS,
  sh: BASH_KEYWORDS,
  shell: BASH_KEYWORDS,
  go: GO_KEYWORDS,
  golang: GO_KEYWORDS,
  rust: RUST_KEYWORDS,
  rs: RUST_KEYWORDS,
};

// ── Token-level highlighter for a single line ──────────────────────────────────
function highlightLine(line: string, keywords: Set<string>): string {
  let result = '';
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // ── single-line comment //
    if (ch === '/' && line[i + 1] === '/') {
      result += CM(line.slice(i));
      break;
    }

    // ── hash comment #
    if (ch === '#') {
      result += CM(line.slice(i));
      break;
    }

    // ── string: single quote '...'
    if (ch === "'") {
      let j = i + 1;
      while (j < line.length && !(line[j] === "'" && line[j - 1] !== '\\')) j++;
      result += ST(line.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // ── string: double quote "..."
    if (ch === '"') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '"' && line[j - 1] !== '\\')) j++;
      result += ST(line.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // ── template literal `...`
    if (ch === '`') {
      let j = i + 1;
      while (j < line.length && !(line[j] === '`' && line[j - 1] !== '\\')) j++;
      result += ST(line.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // ── number
    if (/[0-9]/.test(ch) && (i === 0 || /\W/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9._xXa-fA-FbBoO]/.test(line[j])) j++;
      result += NM(line.slice(i, j));
      i = j;
      continue;
    }

    // ── word (keyword / identifier)
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      // look-ahead: is next non-space char `(` ? → function call
      const after = line.slice(j).trimStart();

      if (keywords.has(word)) {
        // control-flow words get a different shade
        const CF = new Set(['if','else','for','while','do','switch','case','break','continue','return','try','catch','finally','elif','fi','then','done','match','loop']);
        result += CF.has(word) ? KW(word) : K(word);
      } else if (after.startsWith('(')) {
        result += FN(word);
      } else if (/^[A-Z]/.test(word)) {
        result += TY(word);
      } else {
        result += BI(word);
      }

      i = j;
      continue;
    }

    // ── operators and punctuation
    if (/[=+\-*/%<>!&|^~?:,;()[\]{}.]/.test(ch)) {
      result += OP(ch);
      i++;
      continue;
    }

    result += WH(ch);
    i++;
  }

  return result;
}

// ── Highlight a full code block ────────────────────────────────────────────────
function highlightBlock(code: string, lang: string): string {
  const keywords = LANG_KW[lang.toLowerCase()] ?? JS_KEYWORDS;
  return code
    .split('\n')
    .map((line) => highlightLine(line, keywords))
    .join('\n');
}

// ── Markdown inline: bold **text** and `inline code` ─────────────────────────
function renderInline(text: string): string {
  // bold
  text = text.replace(/\*\*(.+?)\*\*/g, (_, t) => chalk.bold.white(t));
  // italic
  text = text.replace(/\*(.+?)\*/g, (_, t) => chalk.italic.dim(t));
  // inline code
  text = text.replace(/`([^`]+)`/g, (_, t) => chalk.hex('#CE9178')(t));
  return text;
}

// ── Full response renderer ─────────────────────────────────────────────────────
export function renderResponse(raw: string): string {
  const ORANGE = chalk.hex('#E8955A');
  const lines = raw.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── fenced code block ```lang
    const fenceMatch = line.match(/^```(\w*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || 'js';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      const highlighted = highlightBlock(codeLines.join('\n'), lang);
      // Add language label
      out.push('');
      if (lang) out.push(chalk.dim(`  ${lang}`));
      for (const hl of highlighted.split('\n')) {
        out.push(`  ${hl}`);
      }
      out.push('');
      continue;
    }

    // ── heading ##
    if (/^#{1,3}\s/.test(line)) {
      const text = line.replace(/^#+\s/, '');
      out.push(chalk.white.bold(`\n  ${text}`));
      i++;
      continue;
    }

    // ── bullet - or *
    if (/^[\-\*]\s/.test(line)) {
      const text = line.replace(/^[\-\*]\s/, '');
      out.push(`  ${ORANGE('•')} ${renderInline(WH(text))}`);
      i++;
      continue;
    }

    // ── numbered list 1.
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1];
      const text = line.replace(/^\d+\.\s/, '');
      out.push(`  ${ORANGE(num + '.')} ${renderInline(WH(text))}`);
      i++;
      continue;
    }

    // ── horizontal rule ---
    if (/^[-─]{3,}$/.test(line.trim())) {
      out.push(chalk.dim('  ' + '─'.repeat(50)));
      i++;
      continue;
    }

    // ── blank line
    if (!line.trim()) {
      out.push('');
      i++;
      continue;
    }

    // ── normal paragraph line
    out.push(`  ${renderInline(WH(line))}`);
    i++;
  }

  return out.join('\n');
}
