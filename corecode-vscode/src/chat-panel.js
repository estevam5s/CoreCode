'use strict';

const vscode = require('vscode');
const { ALL_MODELS, TABS, getModelsByTab, searchModels } = require('./models');

const DEFAULT_MODEL_ID = 'groq/llama-3.3-70b-versatile';

class CoreCodeChatProvider {
  /** @param {vscode.ExtensionContext} context */
  constructor(context) {
    this._context = context;
    this._panel = null;
    this._currentModelId = context.globalState.get('corecode.selectedModel', DEFAULT_MODEL_ID);
  }

  /** Open or reveal the chat panel */
  openChat() {
    if (this._panel) {
      this._panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this._panel = vscode.window.createWebviewPanel(
      'corecode.chat',
      'CoreCode',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      }
    );

    this._panel.iconPath = vscode.Uri.joinPath(
      this._context.extensionUri,
      'media',
      'corecode.svg'
    );

    this._panel.webview.html = this._buildHtml();

    this._panel.webview.onDidReceiveMessage(msg => this._handleMessage(msg));

    this._panel.onDidDispose(() => {
      this._panel = null;
    });
  }

  /** @param {{type:string, payload?:any}} msg */
  _handleMessage(msg) {
    switch (msg.type) {
      case 'ready':
        this._sendState();
        break;

      case 'selectModel':
        this._currentModelId = msg.payload.modelId;
        this._context.globalState.update('corecode.selectedModel', this._currentModelId);
        this._postMessage({ type: 'modelChanged', payload: { modelId: this._currentModelId } });
        break;

      case 'searchModels': {
        const results = searchModels(msg.payload.query);
        this._postMessage({ type: 'searchResults', payload: { models: results } });
        break;
      }

      case 'getTabModels': {
        const models = getModelsByTab(msg.payload.tab);
        this._postMessage({ type: 'tabModels', payload: { tab: msg.payload.tab, models } });
        break;
      }

      case 'sendMessage':
        this._handleChat(msg.payload.text, msg.payload.modelId);
        break;

      case 'launchTerminal':
        vscode.commands.executeCommand('corecode.start');
        break;

      case 'openSettings':
        vscode.commands.executeCommand('workbench.action.openSettings', 'corecode');
        break;
    }
  }

  _sendState() {
    this._postMessage({
      type: 'init',
      payload: {
        modelId: this._currentModelId,
        tabs: TABS,
        allModels: ALL_MODELS,
        defaultTabModels: getModelsByTab('CoreCode'),
      },
    });
  }

  /** @param {string} text @param {string} modelId */
  async _handleChat(text, modelId) {
    if (!text.trim()) return;

    // Echo the user message
    this._postMessage({ type: 'userMessage', payload: { text } });

    // Check if CoreCode CLI is available
    const config = vscode.workspace.getConfiguration('corecode');
    const launchCmd = config.get('launchCommand', 'corecode');

    // For now, guide user to use the terminal
    const tips = [
      `🔌 **Provider configurado:** \`${modelId}\``,
      ``,
      `Para conversar com IA direto no terminal, execute:`,
      `\`\`\``,
      `${launchCmd}`,
      `\`\`\``,
      ``,
      `No CoreCode CLI, use \`/model ${modelId}\` para selecionar este modelo.`,
      ``,
      `💡 Dica: Use **Lançar no Terminal** para abrir o CoreCode agora.`,
    ].join('\n');

    // Simulate a small delay for UX
    await new Promise(r => setTimeout(r, 300));

    this._postMessage({
      type: 'assistantMessage',
      payload: { text: tips },
    });
  }

  /** @param {any} message */
  _postMessage(message) {
    if (this._panel) {
      this._panel.webview.postMessage(message);
    }
  }

  _buildHtml() {
    const tabs = TABS;
    const tabsJson = JSON.stringify(tabs);
    const allModelsJson = JSON.stringify(ALL_MODELS);

    return /* html */`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>CoreCode</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #13131f;
    --bg2:       #1a1a2e;
    --bg3:       #0d0d18;
    --border:    #2a2a42;
    --text:      #e8e8f0;
    --text2:     #888;
    --text3:     #555;
    --accent:    #E8955A;
    --accent2:   #D4603A;
    --free:      #10b981;
    --radius:    10px;
    --font-mono: var(--vscode-editor-font-family, 'Geist Mono', monospace);
    --font:      var(--vscode-font-family, system-ui, sans-serif);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ─────────────────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px 8px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .header-logo {
    width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
  }
  .header-logo svg { width: 20px; height: 20px; }
  .header-title { font-weight: 600; font-size: 13px; color: var(--text); }
  .header-version { font-size: 10px; color: var(--text3); font-family: var(--font-mono); margin-left: 2px; }
  .header-actions { margin-left: auto; display: flex; gap: 6px; }
  .btn-icon {
    background: none; border: 1px solid var(--border); color: var(--text2);
    border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: 11px;
    display: flex; align-items: center; gap: 4px; transition: all 0.15s;
  }
  .btn-icon:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Messages ────────────────────────────────────────────── */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
  }
  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .msg { display: flex; flex-direction: column; gap: 4px; max-width: 100%; }
  .msg.user { align-items: flex-end; }
  .msg.user .bubble {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px 12px 4px 12px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text);
    max-width: 85%;
    word-break: break-word;
  }
  .msg.assistant .bubble {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 4px 12px 12px 12px;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text);
    max-width: 100%;
    line-height: 1.55;
    word-break: break-word;
  }
  .msg.assistant .bubble code {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--bg2);
    padding: 1px 4px;
    border-radius: 4px;
    color: var(--accent);
  }
  .msg.assistant .bubble pre {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px;
    overflow-x: auto;
    margin: 8px 0;
  }
  .msg.assistant .bubble pre code {
    background: none; padding: 0; color: var(--text); font-size: 11px;
  }
  .msg-time { font-size: 10px; color: var(--text3); }

  /* Welcome state */
  .welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    text-align: center;
  }
  .welcome-logo { opacity: 0.5; }
  .welcome-logo svg { width: 48px; height: 48px; }
  .welcome h2 { font-size: 16px; font-weight: 600; color: var(--text); }
  .welcome p { font-size: 12px; color: var(--text2); max-width: 280px; line-height: 1.5; }
  .welcome-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 8px; }
  .chip {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 11px;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chip:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Bottom input bar ────────────────────────────────────── */
  .input-bar {
    border-top: 1px solid var(--border);
    padding: 10px 12px;
    flex-shrink: 0;
    background: var(--bg);
  }
  .input-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 10px;
    transition: border-color 0.15s;
  }
  .input-row:focus-within { border-color: var(--accent); }
  .input-add {
    background: none; border: none; color: var(--text3); cursor: pointer;
    font-size: 18px; line-height: 1; padding: 2px; flex-shrink: 0;
    transition: color 0.15s;
  }
  .input-add:hover { color: var(--accent); }
  .input-textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    resize: none;
    min-height: 20px;
    max-height: 120px;
    line-height: 1.4;
    padding: 2px 0;
  }
  .input-textarea::placeholder { color: var(--text3); }
  .btn-send {
    background: var(--accent);
    border: none;
    color: white;
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    transition: background 0.15s;
    display: flex; align-items: center; gap: 4px;
  }
  .btn-send:hover { background: var(--accent2); }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Status bar ──────────────────────────────────────────── */
  .status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    border-top: 1px solid var(--border);
    background: var(--bg3);
    flex-shrink: 0;
  }
  .status-left { display: flex; align-items: center; gap: 8px; }
  .status-icon { font-size: 12px; color: var(--accent); }
  .status-mode {
    font-size: 11px; color: var(--text2);
    display: flex; align-items: center; gap: 4px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .status-mode:hover { background: var(--bg2); color: var(--text); }
  .status-right { margin-left: auto; }
  .model-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: 6px;
    padding: 3px 8px;
    cursor: pointer;
    font-size: 11px;
    font-family: var(--font-mono);
    transition: all 0.15s;
    max-width: 200px;
  }
  .model-btn:hover { border-color: var(--accent); color: var(--text); }
  .model-btn .chip-icon { font-size: 10px; }
  .model-btn .model-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .model-btn .chevron { flex-shrink: 0; font-size: 10px; }

  /* ── Model Picker Overlay ────────────────────────────────── */
  .picker-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    display: none;
    align-items: flex-end;
    justify-content: stretch;
  }
  .picker-overlay.open { display: flex; }

  .picker {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 14px 14px 0 0;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);   opacity: 1; }
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .picker-header-title { font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: 0.5px; }
  .picker-close {
    background: none; border: none; color: var(--text3); font-size: 18px;
    cursor: pointer; line-height: 1; padding: 0 2px;
  }
  .picker-close:hover { color: var(--text); }

  /* Tabs */
  .picker-tabs {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    scrollbar-width: none;
  }
  .picker-tabs::-webkit-scrollbar { display: none; }
  .picker-tab {
    background: none; border: none;
    color: var(--text3);
    padding: 10px 14px;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .picker-tab:hover { color: var(--text); }
  .picker-tab.active { color: var(--text); border-bottom-color: var(--accent); }

  /* Search */
  .picker-search {
    padding: 10px 14px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
  }
  .search-input {
    width: 100%;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 12px;
    padding: 7px 12px;
    outline: none;
    font-family: var(--font);
    transition: border-color 0.15s;
  }
  .search-input::placeholder { color: var(--text3); }
  .search-input:focus { border-color: var(--accent); }

  /* Model list */
  .picker-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  .picker-list::-webkit-scrollbar { width: 4px; }
  .picker-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .picker-section-label {
    padding: 8px 14px 4px;
    font-size: 10px;
    font-weight: 700;
    color: var(--text3);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .model-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 14px;
    cursor: pointer;
    transition: background 0.12s;
    gap: 8px;
  }
  .model-item:hover { background: var(--bg2); }
  .model-item.selected { background: var(--bg2); }
  .model-item.selected .model-item-name { color: var(--accent); }
  .model-item-left { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .model-item-name { font-size: 13px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .model-item-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .model-item-provider { font-size: 10px; color: var(--text3); }
  .badge {
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .badge-free { background: rgba(16,185,129,0.15); color: var(--free); border: 1px solid rgba(16,185,129,0.3); }
  .badge-new  { background: rgba(232,149,90,0.15); color: var(--accent); border: 1px solid rgba(232,149,90,0.3); }
  .badge-code { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
  .badge-reasoning { background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); }
  .check { color: var(--accent); font-size: 13px; }

  .empty-state {
    padding: 24px;
    text-align: center;
    color: var(--text3);
    font-size: 12px;
  }
</style>
</head>
<body>

<!-- ── Header ───────────────────────────────────────────────── -->
<div class="header">
  <div class="header-logo">
    <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="20" fill="#0a0a0f"/>
      <rect x="12" y="12" width="104" height="104" rx="14" fill="#111118" stroke="#E8955A" stroke-opacity="0.3" stroke-width="1"/>
      <path d="M28 40 L28 88 M28 40 L42 40 M28 88 L42 88" stroke="#E8955A" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 40 L100 88 M100 40 L86 40 M100 88 L86 88" stroke="#D4603A" stroke-width="6" stroke-linecap="round"/>
      <path d="M46 52 L66 64 L46 76" stroke="#E8955A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="70" y="56" width="14" height="16" rx="3" fill="#E8955A" opacity="0.9"/>
    </svg>
  </div>
  <span class="header-title">CoreCode</span>
  <span class="header-version">v0.2.4</span>
  <div class="header-actions">
    <button class="btn-icon" onclick="launchTerminal()" title="Abrir no Terminal">⚡ Terminal</button>
    <button class="btn-icon" onclick="openSettings()" title="Configurações">⚙</button>
  </div>
</div>

<!-- ── Messages ─────────────────────────────────────────────── -->
<div class="messages" id="messages">
  <div class="welcome" id="welcome">
    <div class="welcome-logo">
      <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#0a0a0f"/>
        <rect x="12" y="12" width="104" height="104" rx="14" fill="#111118" stroke="#E8955A" stroke-opacity="0.3" stroke-width="1"/>
        <path d="M28 40 L28 88 M28 40 L42 40 M28 88 L42 88" stroke="#E8955A" stroke-width="6" stroke-linecap="round"/>
        <path d="M100 40 L100 88 M100 40 L86 40 M100 88 L86 88" stroke="#D4603A" stroke-width="6" stroke-linecap="round"/>
        <path d="M46 52 L66 64 L46 76" stroke="#E8955A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="70" y="56" width="14" height="16" rx="3" fill="#E8955A" opacity="0.9"/>
      </svg>
    </div>
    <h2>CoreCode</h2>
    <p>Qualquer modelo. Toda ferramenta. Zero limites.</p>
    <div class="welcome-chips">
      <span class="chip" onclick="fillPrompt('Explique este código')">Explique este código</span>
      <span class="chip" onclick="fillPrompt('Corrija os erros')">Corrija os erros</span>
      <span class="chip" onclick="fillPrompt('Escreva testes unitários')">Escreva testes</span>
      <span class="chip" onclick="fillPrompt('Refatore para melhorar')">Refatore</span>
      <span class="chip" onclick="fillPrompt('Adicione tipos TypeScript')">Adicione tipos</span>
      <span class="chip" onclick="fillPrompt('Gere documentação')">Documentação</span>
    </div>
  </div>
</div>

<!-- ── Input area ────────────────────────────────────────────── -->
<div class="input-bar">
  <div class="input-row">
    <button class="input-add" title="Anexar arquivo">+</button>
    <textarea
      id="chat-input"
      class="input-textarea"
      placeholder="Pergunte ao CoreCode…"
      rows="1"
      onkeydown="handleKeydown(event)"
      oninput="autoResize(this)"
    ></textarea>
    <button class="btn-send" id="send-btn" onclick="sendMessage()">
      ↑
    </button>
  </div>
</div>

<!-- ── Status bar ────────────────────────────────────────────── -->
<div class="status-bar">
  <div class="status-left">
    <span class="status-icon">⚡</span>
    <span class="status-mode">Auto ✎ ∨</span>
  </div>
  <div class="status-right">
    <button class="model-btn" id="model-btn" onclick="openPicker()">
      <span class="chip-icon">🔲</span>
      <span class="model-name" id="model-name-display">llama-3.3-70b</span>
      <span class="chevron">∨</span>
    </button>
  </div>
</div>

<!-- ── Model Picker ──────────────────────────────────────────── -->
<div class="picker-overlay" id="picker-overlay" onclick="closePicker(event)">
  <div class="picker" onclick="event.stopPropagation()">
    <div class="picker-header">
      <span class="picker-header-title">SELECT AI MODEL</span>
      <button class="picker-close" onclick="closePicker()">×</button>
    </div>

    <div class="picker-tabs" id="picker-tabs"></div>

    <div class="picker-search">
      <input
        type="text"
        class="search-input"
        id="search-input"
        placeholder="Buscar modelos..."
        oninput="onSearch(this.value)"
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <div class="picker-list" id="picker-list"></div>
  </div>
</div>

<script>
  const vscode = acquireVsCodeApi();

  let state = {
    modelId: 'groq/llama-3.3-70b-versatile',
    tabs: [],
    allModels: [],
    activeTab: 'CoreCode',
    searchQuery: '',
    isSearching: false,
  };

  // ── Init ──────────────────────────────────────────────────────
  vscode.postMessage({ type: 'ready' });

  window.addEventListener('message', e => {
    const msg = e.data;
    switch (msg.type) {
      case 'init':
        state.modelId    = msg.payload.modelId;
        state.tabs       = msg.payload.tabs;
        state.allModels  = msg.payload.allModels;
        updateModelDisplay();
        renderTabs();
        renderModels();
        break;

      case 'modelChanged':
        state.modelId = msg.payload.modelId;
        updateModelDisplay();
        renderModels();
        break;

      case 'userMessage':
        appendMessage('user', msg.payload.text);
        break;

      case 'assistantMessage':
        appendMessage('assistant', msg.payload.text);
        break;

      case 'searchResults':
        renderSearchResults(msg.payload.models);
        break;
    }
  });

  // ── Model display ─────────────────────────────────────────────
  function updateModelDisplay() {
    const model = state.allModels.find(m => m.id === state.modelId);
    const label = model ? model.name : state.modelId.split('/').pop();
    document.getElementById('model-name-display').textContent = label;
  }

  // ── Chat ──────────────────────────────────────────────────────
  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function fillPrompt(text) {
    const input = document.getElementById('chat-input');
    input.value = text;
    input.focus();
    autoResize(input);
  }

  function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    hideWelcome();
    input.value = '';
    input.style.height = 'auto';

    vscode.postMessage({ type: 'sendMessage', payload: { text, modelId: state.modelId } });
  }

  function appendMessage(role, text) {
    const container = document.getElementById('messages');
    const msg = document.createElement('div');
    msg.className = 'msg ' + role;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = markdownToHtml(text);

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    msg.appendChild(bubble);
    msg.appendChild(time);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function markdownToHtml(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function hideWelcome() {
    const w = document.getElementById('welcome');
    if (w) w.style.display = 'none';
  }

  function launchTerminal() {
    vscode.postMessage({ type: 'launchTerminal' });
  }

  function openSettings() {
    vscode.postMessage({ type: 'openSettings' });
  }

  // ── Picker ────────────────────────────────────────────────────
  function openPicker() {
    document.getElementById('picker-overlay').classList.add('open');
    document.getElementById('search-input').focus();
    state.isSearching = false;
    state.searchQuery = '';
    document.getElementById('search-input').value = '';
    renderTabs();
    renderModels();
  }

  function closePicker(e) {
    if (!e || e.target === document.getElementById('picker-overlay')) {
      document.getElementById('picker-overlay').classList.remove('open');
    }
  }

  function renderTabs() {
    const container = document.getElementById('picker-tabs');
    container.innerHTML = state.tabs.map(tab =>
      `<button class="picker-tab ${tab === state.activeTab ? 'active' : ''}" onclick="switchTab('${tab}')">${tab}</button>`
    ).join('');
  }

  function switchTab(tab) {
    state.activeTab = tab;
    state.searchQuery = '';
    state.isSearching = false;
    document.getElementById('search-input').value = '';
    renderTabs();
    renderModels();
  }

  function onSearch(query) {
    state.searchQuery = query;
    state.isSearching = !!query.trim();
    renderModels();
  }

  function renderModels() {
    const container = document.getElementById('picker-list');
    let models;

    if (state.isSearching) {
      const q = state.searchQuery.toLowerCase();
      models = state.allModels.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      );
    } else {
      models = state.allModels.filter(m => m.tab === state.activeTab);
    }

    if (!models.length) {
      container.innerHTML = '<div class="empty-state">Nenhum modelo encontrado</div>';
      return;
    }

    if (state.isSearching) {
      container.innerHTML = models.map(m => modelItemHtml(m)).join('');
      return;
    }

    // Grouped: FREE first, then rest
    const free = models.filter(m => m.free);
    const paid = models.filter(m => !m.free);

    let html = '';
    if (free.length) {
      html += '<div class="picker-section-label">MODELOS GRATUITOS</div>';
      html += free.map(m => modelItemHtml(m)).join('');
    }
    if (paid.length) {
      html += '<div class="picker-section-label">TODOS OS MODELOS</div>';
      html += paid.map(m => modelItemHtml(m)).join('');
    }

    container.innerHTML = html;
  }

  function modelItemHtml(m) {
    const isSelected = m.id === state.modelId;
    const badgeHtml = m.badge
      ? `<span class="badge badge-${m.badge.toLowerCase().replace(' ', '-')}">${m.badge}</span>`
      : m.free ? '<span class="badge badge-free">FREE</span>' : '';
    const check = isSelected ? '<span class="check">✓</span>' : '';

    return `<div class="model-item ${isSelected ? 'selected' : ''}" onclick="selectModel('${escapeAttr(m.id)}')">
      <div class="model-item-left">
        <span class="model-item-name">${escapeHtml(m.name)}</span>
      </div>
      <div class="model-item-right">
        ${badgeHtml}
        <span class="model-item-provider">${escapeHtml(m.provider)}</span>
        ${check}
      </div>
    </div>`;
  }

  function selectModel(modelId) {
    state.modelId = modelId;
    vscode.postMessage({ type: 'selectModel', payload: { modelId } });
    closePicker();
    updateModelDisplay();
    renderModels();
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function escapeAttr(s) { return String(s || '').replace(/'/g, "\\'"); }
</script>
</body>
</html>`;
  }
}

module.exports = { CoreCodeChatProvider };
