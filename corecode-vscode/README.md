<div align="center">

<img src="https://raw.githubusercontent.com/estevam5s/CoreCode/main/corecode-vscode/media/corecode-cli.png" alt="CoreCode VS Code Extension" width="400" />

<br/>
<br/>

# CoreCode — Extensão VS Code

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-5865F2?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)
[![Version](https://img.shields.io/badge/versão-0.2.1-E8955A?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)
[![Modelos](https://img.shields.io/badge/modelos-348+-white?style=flat-square)](#modelos-disponíveis)
[![Providers](https://img.shields.io/badge/providers-10+-E8955A?style=flat-square)](#provedores)
[![Grátis](https://img.shields.io/badge/Groq-14%20modelos%20grátis-22c55e?style=flat-square)](#modelos-gratuitos-via-groq)
[![License](https://img.shields.io/badge/licença-MIT-white?style=flat-square)](./LICENSE)
[![Publisher](https://img.shields.io/badge/publisher-corecodecli-7289DA?style=flat-square)](https://marketplace.visualstudio.com/publishers/corecodecli)

**348+ modelos de IA diretamente no VS Code — Groq (grátis), Claude, GPT-4.1, Gemini, Grok, DeepSeek, Mistral, Ollama e muito mais.**

[**📦 Instalar no VS Code**](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode) · [**🌐 Site**](https://core-code-landing.vercel.app/) · [**⭐ CLI no GitHub**](https://github.com/estevam5s/CoreCode) · [**📖 Docs**](https://core-code-landing.vercel.app/docs)

</div>

---

## O que é?

**CoreCode VS Code Extension** é a extensão oficial do [CoreCode CLI](https://github.com/estevam5s/CoreCode) para o Visual Studio Code. Ela traz um painel de chat completo com **348+ modelos de IA** para dentro do editor, com seletor de modelos por abas, suporte a múltiplos provedores, integração com o terminal e tema escuro exclusivo.

Criada por **[Estevam Souza](https://github.com/estevam5s)** como interface visual para o CoreCode — sem abrir o navegador, sem trocar de contexto, tudo dentro do VS Code.

---

## ✨ Novidades na v0.2.1

- **Painel de chat completo** — interface de chat estilo Blackbox AI diretamente no editor
- **348+ modelos** — cobrindo 10+ provedores com seletor por abas
- **14 modelos Groq gratuitos** — sem cartão de crédito, comece agora
- **Seletor interativo de modelos** — 8 abas (CoreCode, Claude, OpenAI, Google, xAI, DeepSeek, Mistral, OpenRouter) com busca
- **Badges de destaque** — FREE (verde), New (laranja), Reasoning (azul), Code (amarelo)
- **Integração com terminal** — dispare o CoreCode CLI a um clique
- **Tema CoreCode Terminal Black** — tema escuro exclusivo para terminais
- **Control Center** na Activity Bar com status do workspace

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Chat IA nativo** | Painel WebView com bolhas de chat, markdown renderizado, code blocks |
| **348+ modelos** | Todos os principais modelos de 10+ provedores em um só lugar |
| **Groq gratuito** | 14 modelos grátis por padrão — sem API key para começar |
| **Seletor por abas** | 8 abas de providers com busca em tempo real |
| **Troca de modelo ao vivo** | Mude de modelo sem fechar a conversa |
| **Terminal integrado** | Botão para abrir CoreCode CLI no terminal integrado |
| **Control Center** | Painel lateral com status: instalação, workspace, provider, profile |
| **Tema escuro** | CoreCode Terminal Black — paleta laranja `#E8955A` no terminal |
| **Persistência de sessão** | Modelo selecionado salvo com `globalState` entre sessões |
| **Launch project-aware** | Detecta workspace ativo e inicia o CLI na pasta correta |

---

## Instalação

### Via Command Palette (recomendado)

Pressione `Ctrl+P` (ou `Cmd+P` no macOS) e cole:

```
ext install corecodecli.corecode-vscode
```

### Via busca nas extensões

1. Abra a aba de extensões (`Ctrl+Shift+X`)
2. Pesquise: **CoreCode**
3. Filtre por publisher: **corecodecli**
4. Clique em **Install**

### Via link direto

[Instalar no VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)

### Via VSIX (instalação offline)

```bash
# Baixe o .vsix e instale manualmente
code --install-extension corecode-vscode-0.2.1.vsix
```

---

## Pré-requisitos

| Requisito | Versão mínima |
|---|---|
| VS Code | `≥ 1.95.0` |
| Node.js | `≥ 20` (para o CoreCode CLI) |
| CoreCode CLI | Opcional — necessário para lançar no terminal |

### Instalar o CoreCode CLI

```bash
npm install -g @estevamsl/corecode
# ou
curl -fsSL https://raw.githubusercontent.com/estevam5s/CoreCode/main/install.sh | sh
```

---

## Primeiro uso — Chat IA

### 1. Abrir o Chat

Três formas de abrir o painel de chat:

- Clique no ícone **CoreCode** na Activity Bar (barra lateral esquerda)
- Use o atalho via `Command Palette` → **CoreCode: Abrir Chat IA**
- Clique no ícone `💬` no cabeçalho de qualquer arquivo aberto

### 2. Selecionar um modelo

O painel inicia com o modelo padrão `groq/llama-3.3-70b-versatile` (gratuito).

Para trocar:
1. Clique na **barra de status inferior** do chat (mostra o modelo ativo)
2. O **seletor de modelos** abre com 8 abas de providers
3. Use a **busca** para filtrar por nome
4. Clique no modelo desejado

### 3. Conversar

Digite sua pergunta no campo de input e pressione `Enter` ou clique no botão de envio. O modelo responde com markdown renderizado, incluindo code blocks com syntax highlighting.

---

## Seletor de Modelos

O seletor possui 8 abas com modelos reais:

### CoreCode (Groq — Gratuitos)

| Modelo | Velocidade | Contexto |
|---|---|---|
| `Llama 3.3 70B` | ~800 tok/s | 128k |
| `Llama 3.1 8B Instant` | ~1200 tok/s | 128k |
| `Llama 3 70B` | ~700 tok/s | 8k |
| `Mixtral 8x7B` | ~600 tok/s | 32k |
| `Gemma 2 9B` | ~900 tok/s | 8k |
| `Llama 3.2 90B Vision` | — | 128k |
| `DeepSeek R1 Distill 70B` | ~400 tok/s | 128k |
| `Qwen QwQ 32B` | ~500 tok/s | 32k |
| e mais 6 modelos… | | |

### Claude (Anthropic)

| Modelo | Badge |
|---|---|
| `Claude Opus 4.6` | **New** |
| `Claude Sonnet 4.6` | **New** |
| `Claude Haiku 4.5` | — |
| `Claude 3.5 Sonnet` | — |
| `Claude 3.5 Haiku` | — |
| `Claude 3 Opus` | — |
| `Claude 3 Sonnet` | — |
| `Claude 3 Haiku` | — |
| `Claude 2.1` | — |

### OpenAI

| Modelo | Badge |
|---|---|
| `GPT-4o` | — |
| `GPT-4o Mini` | FREE |
| `GPT-4.1` | **New** |
| `o1` | Reasoning |
| `o3` | Reasoning |
| `o4 Mini` | **New** |
| `GPT-4 Turbo` | — |
| e mais… | |

### Google

| Modelo | Badge |
|---|---|
| `Gemini 2.0 Flash` | **New** |
| `Gemini 2.0 Flash Lite` | **New** |
| `Gemini 1.5 Pro` | — |
| `Gemini 1.5 Flash` | — |
| `Gemini Ultra` | — |
| `Gemma 2 27B` | — |
| `Gemma 2 9B` | — |

### xAI

| Modelo | Badge |
|---|---|
| `Grok 3` | **New** |
| `Grok 3 Mini` | **New** |
| `Grok 2` | — |
| `Grok Vision Beta` | — |
| `Grok Beta` | — |

### DeepSeek

| Modelo | Badge |
|---|---|
| `DeepSeek R1` | Reasoning |
| `DeepSeek V3` | — |
| `DeepSeek Coder V2` | Code |
| `DeepSeek Chat` | — |
| `DeepSeek R1 Zero` | Reasoning |

### Mistral

| Modelo | Badge |
|---|---|
| `Mistral Large 2` | — |
| `Mistral Small` | — |
| `Codestral` | Code |
| `Mixtral 8x22B` | — |
| `Mistral 7B` | — |
| `Pixtral Large` | — |
| `Mistral Nemo` | — |
| `Ministral 8B` | — |
| `Ministral 3B` | — |

### OpenRouter (30+ exclusivos)

| Modelo | Provider |
|---|---|
| `Llama 3.1 405B` | Meta |
| `Nous Hermes 3` | NousResearch |
| `Perplexity Sonar Pro` | Perplexity |
| `Command R+` | Cohere |
| `Phi-4` | Microsoft |
| `Amazon Nova Pro` | Amazon |
| `Qwen 2.5 72B` | Alibaba |
| e 23+ modelos… | |

---

## Modelos Gratuitos via Groq

Sem precisar de API key para começar — 14 modelos gratuitos na aba **CoreCode**:

```
groq/llama-3.3-70b-versatile        ← padrão recomendado
groq/llama-3.1-8b-instant           ← mais rápido
groq/llama3-70b-8192
groq/mixtral-8x7b-32768
groq/gemma2-9b-it
groq/gemma-7b-it
groq/llama-guard-3-8b
groq/llama-3.3-70b-specdec
groq/llama-3.2-90b-vision-preview   ← visão
groq/llama-3.2-11b-vision-preview   ← visão
groq/llama-3.2-3b-preview
groq/llama-3.2-1b-preview
groq/deepseek-r1-distill-llama-70b  ← raciocínio
groq/qwen-qwq-32b                   ← raciocínio
```

> Para usar modelos pagos (Claude, GPT-4.1, etc.), configure sua API key nas configurações da extensão ou via variáveis de ambiente.

---

## Comandos disponíveis

| Comando | Título | Descrição |
|---|---|---|
| `corecode.openChat` | CoreCode: Abrir Chat IA | Abre/foca o painel de chat |
| `corecode.start` | CoreCode: Launch in Terminal | Inicia o CLI no terminal integrado |
| `corecode.startInWorkspaceRoot` | CoreCode: Launch in Workspace Root | Inicia o CLI na raiz do workspace |
| `corecode.openDocs` | CoreCode: Open Repository | Abre o GitHub do CoreCode |
| `corecode.openSetupDocs` | CoreCode: Open Setup Guide | Abre o guia de configuração |
| `corecode.openWorkspaceProfile` | CoreCode: Open Workspace Profile | Abre o `.corecode-profile.json` |
| `corecode.openControlCenter` | CoreCode: Open Control Center | Abre o Control Center lateral |

### Atalhos de teclado sugeridos

Adicione em `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+a",
    "command": "corecode.openChat"
  },
  {
    "key": "ctrl+shift+t",
    "command": "corecode.start"
  }
]
```

---

## Configurações

| Chave | Padrão | Descrição |
|---|---|---|
| `corecode.launchCommand` | `"corecode"` | Comando executado no terminal ao iniciar o CoreCode |
| `corecode.terminalName` | `"CoreCode"` | Nome da aba do terminal integrado |
| `corecode.useOpenAIShim` | `false` | Injeta `CLAUDE_CODE_USE_OPENAI=1` no terminal |
| `corecode.defaultModel` | `"groq/llama-3.3-70b-versatile"` | Modelo padrão do Chat IA |

### Configurar via `settings.json`

```json
{
  "corecode.launchCommand": "corecode",
  "corecode.terminalName": "CoreCode AI",
  "corecode.defaultModel": "claude-sonnet-4-6",
  "corecode.useOpenAIShim": false
}
```

---

## Control Center

O **Control Center** fica na Activity Bar (barra lateral esquerda) e mostra:

- ✅ / ❌ Se o comando `corecode` está instalado no PATH
- 📁 Workspace ativo e diretório de trabalho que será usado
- 🤖 Provider e modelo detectados (via `.corecode-profile.json` ou variáveis de ambiente)
- 🔧 Comando de launch configurado
- 📄 Se existe `.corecode-profile.json` na raiz do projeto

### `.corecode-profile.json`

Arquivo de perfil por projeto — salvo na raiz do workspace:

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "Você é um assistente especialista em TypeScript e React."
}
```

O Control Center prioriza este arquivo sobre variáveis de ambiente para mostrar o status correto.

---

## Tema CoreCode Terminal Black

A extensão inclui um tema escuro exclusivo para o terminal:

**Ativar:**
1. `Ctrl+Shift+P` → `Preferences: Color Theme`
2. Selecione **CoreCode Terminal Black**

**Características:**
- Fundo: `#0a0a0f` (preto profundo)
- Laranja primário: `#E8955A`
- Laranja secundário: `#D4603A`
- Strings: `#E8955A`
- Comentários: `#444466`
- Palavras-chave: `#7289DA`

---

## Arquitetura da extensão

```
corecode-vscode/
├── src/
│   ├── extension.js       # Ponto de entrada — registra comandos e providers
│   ├── chat-panel.js      # CoreCodeChatProvider — WebviewPanel com chat UI
│   ├── models.js          # Registro de 348+ modelos com tabs e metadados
│   ├── presentation.js    # Control Center — WebviewView na Activity Bar
│   └── state.js           # Gerenciamento de estado do workspace e profile
├── media/
│   ├── corecode-cli.png   # Ícone da extensão (128×128 PNG)
│   └── corecode.svg       # Ícone SVG para o painel
├── themes/
│   └── CoreCode-Terminal-Black.json  # Tema escuro
└── package.json           # Manifesto da extensão
```

### Fluxo de dados do Chat

```
Usuário digita → WebView (chat-panel HTML)
  → postMessage({ type: 'sendMessage', payload: { text, modelId } })
  → CoreCodeChatProvider._handleMessage()
  → CoreCodeChatProvider._handleChat(text, modelId)
  → Resposta (mock ou API)
  → postMessage({ type: 'appendChunk', payload: { chunk } })
  → WebView renderiza na bolha de resposta
```

### Registro de modelos (`models.js`)

```js
const ALL_MODELS = [
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    tab: 'CoreCode',
    free: true,
  },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    tab: 'Claude',
    badge: 'New',
  },
  // ... 346+ modelos
];
```

---

## Desenvolvimento local

### Requisitos

- Node.js ≥ 20
- VS Code ≥ 1.95
- `@vscode/vsce` para empacotamento

### Setup

```bash
# Clone o repositório
git clone https://github.com/estevam5s/CoreCode.git
cd CoreCode/corecode-vscode

# Instale as dependências (nenhuma runtime dependency)
npm install

# Abra no VS Code
code .
```

### Executar em modo desenvolvimento

1. Pressione `F5` no VS Code para abrir uma **Extension Development Host**
2. Na janela que abrir, use `Ctrl+Shift+P` → **CoreCode: Abrir Chat IA**

### Testes

```bash
npm run test
```

Os testes usam o Node.js test runner nativo (`node --test`).

### Lint

```bash
npm run lint
```

Verifica sintaxe JS via `node --check` (sem dependências externas).

### Empacotar `.vsix`

```bash
npm run package
# ou
npx @vscode/vsce package --no-dependencies
```

Gera: `corecode-vscode-X.Y.Z.vsix`

### Instalar localmente

```bash
code --install-extension corecode-vscode-0.2.1.vsix
```

### Publicar no Marketplace

```bash
npx @vscode/vsce publish -p SEU_PAT --no-dependencies
```

> Necessário ter o publisher `corecodecli` criado em [marketplace.visualstudio.com/manage/publishers](https://marketplace.visualstudio.com/manage/publishers).

---

## Contribuindo

Pull requests são bem-vindos!

```bash
# Fork → clone → branch
git clone https://github.com/estevam5s/CoreCode.git
cd CoreCode/corecode-vscode
git checkout -b feature/minha-funcionalidade

# Desenvolva
# Pressione F5 para testar

# Abra um PR
```

### Adicionar um novo modelo

Edite `src/models.js` e adicione na lista `ALL_MODELS`:

```js
{
  id: 'provider/model-id',     // ID único usado na API
  name: 'Nome do Modelo',      // Nome exibido no seletor
  provider: 'NomeProvider',    // Provider (string)
  tab: 'NomeAba',              // Aba onde aparece (CoreCode, Claude, OpenAI...)
  free: true,                  // opcional — exibe badge FREE verde
  badge: 'New',                // opcional — New, Reasoning, Code
}
```

### Adicionar uma nova aba

Em `src/models.js`, adicione o nome da aba ao array `TABS` e atribua modelos com `tab: 'NovaAba'`.

---

## Perguntas frequentes

**Q: Preciso de API key para usar?**
Não. A aba **CoreCode** usa modelos Groq que funcionam sem configuração. Para Claude, GPT-4, etc., você precisará de chave do provider respectivo.

**Q: Como configurar minha chave de API?**
Configure como variável de ambiente:
```bash
export GROQ_API_KEY=gsk_...
export OPENAI_API_KEY=sk-proj-...
export ANTHROPIC_API_KEY=sk-ant-...
```
Ou via `corecode.defaultModel` nas configurações do VS Code.

**Q: A extensão envia meu código para servidores externos?**
Apenas quando você envia uma mensagem. As mensagens são enviadas diretamente para a API do provider escolhido (Groq, OpenAI, Anthropic, etc.). A extensão em si não coleta nenhum dado.

**Q: Funciona com VS Code Insiders?**
Sim, plenamente compatível.

**Q: Posso usar com Cursor ou outras forks do VS Code?**
Compatível com qualquer fork que suporte extensões do Marketplace.

---

## Changelog

### v0.2.1
- Publisher migrado para `corecodecli`
- Descrição e keywords melhoradas para busca no Marketplace
- Correção de nome do tema (`CoreCode-Terminal-Black.json`)
- Adição de LICENSE MIT

### v0.2.0
- **Painel de Chat IA completo** — interface WebView com 348+ modelos
- **Seletor de modelos por abas** — 8 providers com busca
- **14 modelos Groq gratuitos** na aba CoreCode
- Badges por tipo: FREE, New, Reasoning, Code
- Integração com terminal para lançar CoreCode CLI
- Botão de configurações e terminal no cabeçalho do chat
- Persistência do modelo selecionado via `globalState`

### v0.1.0
- Lançamento inicial — Control Center básico
- Comandos de launch no terminal
- Tema CoreCode Terminal Black

---

## Links úteis

| Recurso | URL |
|---|---|
| **Marketplace** | [marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode) |
| **CoreCode CLI** | [npmjs.com/package/@estevamsl/corecode](https://www.npmjs.com/package/@estevamsl/corecode) |
| **Site oficial** | [core-code-landing.vercel.app](https://core-code-landing.vercel.app/) |
| **GitHub** | [github.com/estevam5s/CoreCode](https://github.com/estevam5s/CoreCode) |
| **Issues** | [github.com/estevam5s/CoreCode/issues](https://github.com/estevam5s/CoreCode/issues) |
| **Publisher** | [marketplace.visualstudio.com/publishers/corecodecli](https://marketplace.visualstudio.com/publishers/corecodecli) |

---

## Autor

Criado por **Estevam Souza**

- GitHub: [@estevam5s](https://github.com/estevam5s)
- Site: [core-code-landing.vercel.app](https://core-code-landing.vercel.app/)
- npm: [@estevamsl/corecode](https://www.npmjs.com/package/@estevamsl/corecode)

---

## Licença

MIT © [Estevam Souza](https://github.com/estevam5s)

---

<div align="center">

**[⬆ Voltar ao topo](#corecode--extensão-vs-code)**

Feito com ❤️ por [Estevam Souza](https://github.com/estevam5s)

</div>
