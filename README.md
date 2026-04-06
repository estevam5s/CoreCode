<div align="center">

<img src="https://raw.githubusercontent.com/estevam5s/CoreCode/main/public/corecode-cli.png" alt="CoreCode" width="400" />

<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/@estevamsl/corecode?style=flat-square&color=E8955A&label=npm)](https://www.npmjs.com/package/@estevamsl/corecode)
[![npm downloads](https://img.shields.io/npm/dm/@estevamsl/corecode?style=flat-square&color=white)](https://www.npmjs.com/package/@estevamsl/corecode)
[![Node](https://img.shields.io/badge/node-%3E%3D20-white?style=flat-square&logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)](./LICENSE)
[![Providers](https://img.shields.io/badge/providers-10+-E8955A?style=flat-square)](#provedores)
[![Models](https://img.shields.io/badge/models-348+-white?style=flat-square)](#openrouter--200-modelos)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-5865F2?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)
[![Site](https://img.shields.io/badge/site-core--code--landing.vercel.app-white?style=flat-square)](https://core-code-landing.vercel.app/)

**Agente de IA multi-modelo para o seu terminal — qualquer modelo, toda ferramenta, zero limites.**

[**🌐 Site**](https://core-code-landing.vercel.app/) · [**📦 npm**](https://www.npmjs.com/package/@estevamsl/corecode) · [**📖 Docs**](https://core-code-landing.vercel.app/docs) · [**⭐ GitHub**](https://github.com/estevam5s/CoreCode) · [**🧩 VS Code**](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)

</div>

---

## O que é o CoreCode?

**CoreCode** é um agente de IA open-source que roda inteiramente no seu terminal. Alterne entre Groq (grátis), OpenRouter (200+ modelos), OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Ollama e qualquer API compatível com OpenAI — tudo com comandos como `/model` e `/provider`, sem GUI, sem Electron, sem lock-in.

Criado por **[Estevam Souza](https://github.com/estevam5s)** como uma alternativa rápida, extensível e totalmente aberta às ferramentas de IA que prendem o usuário em um único provedor.

---

## ✨ Novidades na v0.2.0

- **Onboarding interativo** — tela de boas-vindas com seleção de tema (↑↓ arrow keys) + seletor de provedor com hints ao lado de cada opção
- **OpenRouter** — acesso a 200+ modelos (GPT-4o, Claude, DeepSeek, Gemini, Grok, Mistral, Qwen, Llama...) com uma única chave
- **DeepSeek nativo** — deepseek-chat, deepseek-reasoner, deepseek-coder com endpoint direto
- **Mistral nativo** — mistral-large, codestral, mistral-small com endpoint direto
- **Seleção de modelo no setup** — após escolher o provedor, a CLI mostra um menu de modelos disponíveis
- **10+ provedores** — Groq, OpenRouter, OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Ollama, OpenAI-Compatible, Mock

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **10+ provedores** | Groq, OpenRouter, OpenAI, Gemini, Anthropic, DeepSeek, Mistral, Ollama, OpenAI-compat, Mock |
| **200+ modelos via OpenRouter** | GPT-4o, Claude, Gemini, DeepSeek-R1, Grok, Qwen, Llama, Mistral, Phi e muito mais |
| **Troca ao vivo** | `/provider groq` → `/model llama-3.3-70b` sem reiniciar |
| **Onboarding interativo** | Setup guiado com arrow keys na primeira execução |
| **Agente de arquivos** | `@src/**/*.ts` lê e injeta arquivos no contexto automaticamente |
| **Ferramenta Bash** | `!npm test` executa e injeta saída no contexto da IA |
| **Busca na web** | `/search <query>` via DuckDuckGo, sem chave de API |
| **Diff & Aplicar** | Patches gerados pela IA aplicados via marcadores `// FILE:` |
| **Syntax highlighting** | Paleta VS Code Dark+ para 10+ linguagens |
| **Gestão de sessão** | `/save`, `/export`, `/compact`, `/retry`, `/copy` |
| **Chaves em runtime** | `/key groq sk-...` sem editar `.env` |
| **System prompt** | `/system <prompt>` customizável por sessão |
| **Histórico comprimível** | `/compact` resume 40+ msgs em um único contexto |
| **20+ slash commands** | Referência completa abaixo |
| **Zero telemetria** | Sem tracking, sem analytics, sem coleta de dados |

---

## Instalação

### Via npm (recomendado)

```bash
npm install -g @estevamsl/corecode
```

### Via curl

```bash
curl -fsSL https://raw.githubusercontent.com/estevam5s/CoreCode/main/install.sh | sh
```

```bash
corecode
```

> Requer Node.js ≥ 20. Funciona em macOS, Linux e WSL.

---

## Primeiro uso — Onboarding interativo

Na primeira vez que você executa `corecode` sem nenhuma chave de API configurada, o assistente de configuração é iniciado automaticamente:

### Tela 1 — Seleção de tema

```
        *           *
  *   ┌─────┐
      │ ◉ ◉ │   *
  *   │  ▽  │
      └──┬──┘     *
   *   ┌──┴──┐
      │     │
      └─┘ └─┘   *

Let's get started.

Choose the text style that looks best with your terminal
To change this later, run /theme

────────────────────────────────────────────────────────
> 1. Dark mode             · ✓ recommended
  2. Light mode
  3. Dark mode (colorblind-friendly)
  4. Light mode (colorblind-friendly)
  5. Dark mode (ANSI colors only)
  6. Light mode (ANSI colors only)
```

### Tela 2 — Seleção de provedor

```
CoreCode works with any AI provider using your own API keys.

Select provider:
Use ↑↓ arrows or type a number, then Enter

────────────────────────────────────────────────────────────────────────
> 1. Groq              · Free · llama-3.3-70b, mixtral, gemma2
  2. OpenRouter         · 200+ models · GPT-4o, Claude, DeepSeek, Gemini, Grok...
  3. OpenAI             · GPT-4o, o3-mini, gpt-4-turbo
  4. Anthropic          · Claude Sonnet, Opus, Haiku
  5. Google Gemini      · Gemini 2.0 Flash, 1.5 Pro
  6. DeepSeek           · deepseek-chat, deepseek-r1, deepseek-coder
  7. Mistral            · mistral-large, codestral, mistral-small
  8. Ollama (local)     · 100% offline · No API key needed
  9. OpenAI-Compatible  · vLLM, LM Studio, any custom endpoint
```

### Tela 3 — Seleção de modelo (ex: OpenRouter)

```
Select model from OpenRouter:
200+ models available · showing popular options

────────────────────────────────────────────────────────────────────
> 1. openai/gpt-4o                          · OpenAI · Best quality
  2. openai/gpt-4o-mini                     · OpenAI · Fast & affordable
  3. openai/o3-mini                         · OpenAI · Reasoning model
  4. anthropic/claude-sonnet-4-5            · Anthropic · Top coding model
  5. anthropic/claude-opus-4                · Anthropic · Most capable
  6. google/gemini-2.0-flash-exp            · Google · Fast & free tier
  7. meta-llama/llama-3.3-70b-instruct      · Meta · Best open LLM
  8. deepseek/deepseek-chat                 · DeepSeek · General purpose
  9. deepseek/deepseek-r1                   · DeepSeek · Reasoning
  ...38 modelos disponíveis
```

A configuração é salva automaticamente em `.env`.

---

## Início rápido

### Groq — grátis, sem cartão

```bash
export GROQ_API_KEY=gsk_sua_chave
corecode
```

> Obtenha sua chave gratuita em [console.groq.com](https://console.groq.com) — nenhum cartão necessário.

### OpenRouter — 200+ modelos com uma chave

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
corecode
# Selecione "OpenRouter" no setup → escolha o modelo
```

> Chave em [openrouter.ai/keys](https://openrouter.ai/keys). Créditos gratuitos para novos usuários.

### Arquivo `.env` (recomendado para projetos)

```env
# .env no diretório de trabalho
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=sk-...
MISTRAL_API_KEY=...

CORECODE_DEFAULT_PROVIDER=groq
CORECODE_DEFAULT_MODEL=llama-3.3-70b-versatile
```

---

## Provedores

### Groq — ultra-rápido e gratuito

| Modelo | Tokens/s | Contexto | Uso |
|---|---|---|---|
| `llama-3.3-70b-versatile` | ~800 | 128k | Uso geral — **recomendado** |
| `llama-3.1-8b-instant` | ~1200 | 128k | Tarefas rápidas |
| `mixtral-8x7b-32768` | ~600 | 32k | Contexto longo |
| `gemma2-9b-it` | ~900 | 8k | Alternativa leve |
| `deepseek-r1-distill-llama-70b` | ~400 | 128k | Raciocínio |

```bash
/provider groq
/model llama-3.3-70b-versatile
```

---

### OpenRouter — 200+ modelos

Acesse OpenAI, Anthropic, Google, Meta, DeepSeek, Mistral, Qwen, xAI e muitos mais com **uma única chave de API**.

| Categoria | Modelos |
|---|---|
| **OpenAI** | gpt-4o, gpt-4o-mini, o3-mini, o1, gpt-4-turbo |
| **Anthropic** | claude-sonnet-4-5, claude-opus-4, claude-haiku-3-5 |
| **Google** | gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash |
| **Meta / Llama** | llama-3.3-70b-instruct, llama-3.1-405b-instruct, llama-3.2-3b |
| **DeepSeek** | deepseek-chat, deepseek-r1, deepseek-r1-distill-llama-70b, deepseek-coder-v2 |
| **Mistral** | mistral-large-2411, codestral-2501, mistral-medium, mistral-7b |
| **Qwen (Alibaba)** | qwen-2.5-72b-instruct, qwen-2.5-coder-32b, qwq-32b-preview |
| **xAI** | grok-2-1212, grok-beta |
| **Cohere** | command-r-plus, command-r |
| **Perplexity** | sonar-pro, sonar |
| **MiniMax** | minimax-01 (1M context) |
| **Microsoft** | phi-4, phi-3.5-mini-128k-instruct |
| **Amazon** | nova-pro-v1 |
| **NousResearch** | hermes-3-llama-3.1-405b |

```bash
/provider openai-compatible  # OpenRouter usa endpoint OpenAI-compat
/model openai/gpt-4o
/model deepseek/deepseek-r1
/model meta-llama/llama-3.3-70b-instruct
```

---

### DeepSeek — raciocínio avançado

```bash
export DEEPSEEK_API_KEY=sk-...
/provider openai-compatible
/model deepseek-chat       # uso geral
/model deepseek-reasoner   # cadeia de pensamento (CoT)
/model deepseek-coder      # especialista em código
```

> Chave em [platform.deepseek.com](https://platform.deepseek.com/api_keys)

---

### Mistral — velocidade e qualidade

```bash
export MISTRAL_API_KEY=...
/provider openai-compatible
/model mistral-large-latest   # flagship
/model codestral-latest       # especialista em código
/model mistral-small-latest   # rápido e econômico
```

> Chave em [console.mistral.ai](https://console.mistral.ai/api-keys)

---

### Ollama — 100% local, offline

```bash
# 1. Instale: https://ollama.ai
ollama pull qwen2.5-coder:7b   # melhor modelo local para código
ollama pull llama3.2            # uso geral
ollama pull phi4                # Microsoft, compacto mas poderoso

# 2. Inicie
/provider ollama
/model qwen2.5-coder:7b
```

---

### OpenAI / Anthropic / Gemini

```bash
# OpenAI
export OPENAI_API_KEY=sk-proj-...
/provider openai
/model gpt-4o

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
/provider anthropic
/model claude-sonnet-4-6

# Google Gemini
export GEMINI_API_KEY=AIza...
/provider gemini
/model gemini-2.0-flash
```

---

### OpenAI-Compatible (vLLM, LM Studio, Jan, LocalAI)

```bash
export OPENAI_BASE_URL=http://localhost:1234/v1
export OPENAI_API_KEY=qualquer-coisa   # pode ser vazio
/provider openai-compatible
/model seu-modelo-aqui
```

---

## Referência de comandos

### Sessão

| Comando | Descrição |
|---|---|
| `/help` | Mostra todos os comandos disponíveis |
| `/status` | Provedor, modelo, histórico, system prompt |
| `/version` | Versão instalada do CoreCode |
| `/env` | Status das chaves de API por provedor |
| `/exit` / `/quit` | Sai do CoreCode |

### Modelo & Provedor

| Comando | Descrição |
|---|---|
| `/model` | Mostra o modelo ativo |
| `/model <nome>` | Troca de modelo |
| `/model list` | Lista modelos builtin do provedor atual |
| `/model list --all` | Busca todos os modelos via API |
| `/provider` | Mostra o provedor ativo |
| `/provider <nome>` | Troca de provedor (`groq`, `openai`, `anthropic`...) |
| `/provider list` | Lista todos os provedores com tags FREE / LOCAL / PAID |
| `/add <provedor> <modelo>` | Registra modelo customizado (fine-tuned, etc.) |
| `/key <provedor> <api-key>` | Define chave de API em runtime sem editar `.env` |

### Conversa

| Comando | Descrição |
|---|---|
| `/history` | Mostra histórico resumido (últimas 40 mensagens) |
| `/history full` | Mostra histórico completo sem truncamento |
| `/clear` | Limpa o histórico — IA começa do zero |
| `/reset` | Limpa histórico + restaura system prompt padrão |
| `/compact` | Comprime o histórico em um único resumo |
| `/retry` | Reenvia a última mensagem (remove o par anterior) |
| `/copy` | Copia a última resposta da IA para o clipboard |

### System Prompt

| Comando | Descrição |
|---|---|
| `/system <prompt>` | Define system prompt customizado para a sessão |
| `/system show` | Mostra o system prompt atual |
| `/system reset` | Restaura o system prompt padrão |

### Ferramentas

| Comando | Descrição |
|---|---|
| `/search <query>` | Busca na web via DuckDuckGo, injeta resultados |
| `/tools` | Lista ferramentas disponíveis e status |
| `!<comando>` | Executa comando shell, injeta saída no contexto |
| `@<arquivo>` | Lê arquivo no contexto da conversa |
| `@<glob>` | Lê múltiplos arquivos (ex: `@src/**/*.ts`) |

### Exportar / Salvar

| Comando | Descrição |
|---|---|
| `/save [arquivo]` | Salva conversa atual como Markdown |
| `/export [arquivo]` | Alias para `/save` |

---

## Variáveis de ambiente

| Variável | Provedor | Descrição |
|---|---|---|
| `GROQ_API_KEY` | Groq | Chave em [console.groq.com](https://console.groq.com) |
| `OPENAI_API_KEY` | OpenAI / compat | Chave em [platform.openai.com](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | Anthropic | Chave em [console.anthropic.com](https://console.anthropic.com) |
| `GEMINI_API_KEY` | Gemini | Chave em [aistudio.google.com](https://aistudio.google.com) |
| `OPENROUTER_API_KEY` | OpenRouter | Chave em [openrouter.ai/keys](https://openrouter.ai/keys) |
| `DEEPSEEK_API_KEY` | DeepSeek | Chave em [platform.deepseek.com](https://platform.deepseek.com) |
| `MISTRAL_API_KEY` | Mistral | Chave em [console.mistral.ai](https://console.mistral.ai) |
| `OPENAI_BASE_URL` | OpenAI-compat | URL base customizada (padrão: `https://api.openai.com/v1`) |
| `OLLAMA_BASE_URL` | Ollama | URL local (padrão: `http://localhost:11434`) |
| `CORECODE_DEFAULT_PROVIDER` | — | Provedor padrão na inicialização |
| `CORECODE_DEFAULT_MODEL` | — | Modelo padrão na inicialização |
| `CORECODE_SYSTEM` | — | System prompt padrão (opcional) |
| `CORECODE_THEME` | — | Tema da interface (`dark`, `light`, `dark-cb`...) |

---

## Uso avançado

### Trocar de provedor no meio da conversa

O histórico é preservado ao trocar de provedor.

```
> /provider anthropic
● anthropic · claude-sonnet-4-6

> explique async/await em profundidade
● …

> /provider groq
● groq · llama-3.3-70b-versatile

> /model deepseek-r1-distill-llama-70b
● deepseek-r1-distill-llama-70b
```

### Analisar um projeto inteiro com glob

```
> @src/**/*.ts revise o fluxo de autenticação e encontre possíveis vulnerabilidades
● Lendo 12 arquivos TypeScript...
● Encontrei possíveis problemas em auth/middleware.ts...
```

### Executar testes e discutir falhas

```
> !npm test -- --coverage
● Execute: npm test -- --coverage ? [y/N] y
● Running...

  FAIL src/auth.test.ts
  ✕ should reject invalid token

> por que o teste falhou? como corrigir?
● Analisando o output do Jest...
```

### Buscar na web e usar como contexto

```
> /search melhores práticas React Server Components 2025
● Pesquisando via DuckDuckGo...
> com base nesses resultados, refatore meu componente @src/app/page.tsx
```

### Agente de código — diff & apply

```
> refatore a função de autenticação em @src/auth.ts para usar async/await

● Here's the refactored version:

// FILE: src/auth.ts
- async function login(user, pass) {
-   return new Promise((resolve) => { ... });
- }
+ async function login(user: string, pass: string): Promise<User> {
+   const result = await authService.verify(user, pass);
+   return result;
+ }

Apply this diff? [y/N] y
● Written: src/auth.ts
```

### Compactar histórico longo

```
> /compact
● 38 mensagens compactadas em resumo de contexto
```

### Registrar modelo fine-tuned

```
> /add openai ft:gpt-4o-2024-08-06:minha-org:meu-modelo:abc123
● Modelo registrado
> /model ft:gpt-4o-2024-08-06:minha-org:meu-modelo:abc123
```

### Definir chave em runtime (sem `.env`)

```
> /key anthropic sk-ant-api03-...
● ANTHROPIC_API_KEY definida para esta sessão
> /provider anthropic
● anthropic · claude-sonnet-4-6
```

### Usar DeepSeek-R1 para raciocínio complexo

```
> /key deepseek sk-...
> /provider openai-compatible
> /model deepseek-reasoner

> implemente um algoritmo de ordenação topológica com detecção de ciclos
● <think>
  Vou analisar o problema passo a passo...
  </think>
  
  Aqui está a implementação com detecção de ciclos via DFS...
```

### Usar Ollama offline

```bash
# Instale e baixe modelos sem internet depois
ollama pull qwen2.5-coder:7b
ollama pull llama3.2

# No CoreCode
> /provider ollama
> /model qwen2.5-coder:7b
> @src/components/Button.tsx adicione testes unitários para este componente
```

---

## Estrutura do projeto

```
CoreCode/
├── src/corecode/
│   ├── main.ts              # entrypoint — carrega .env e inicia REPL
│   ├── repl.ts              # loop REPL + orquestração de ferramentas
│   ├── commands.ts          # 20+ slash commands (/model, /provider, /save...)
│   ├── router.ts            # roteamento de provedores de IA
│   ├── state.ts             # estado da sessão (provider, model, history)
│   ├── banner.ts            # logo ASCII em gradiente laranja
│   ├── welcome.ts           # caixa de informações na inicialização
│   ├── highlighter.ts       # syntax highlighting (10+ linguagens)
│   ├── spinner.ts           # indicador de carregamento animado
│   ├── setup-wizard.ts      # onboarding interativo com arrow keys
│   └── providers/
│       ├── openai.ts        # OpenAI + OpenAI-compatible (streaming SSE)
│       ├── groq.ts          # Groq (compatível com OpenAI)
│       ├── gemini.ts        # Google Gemini (API nativa)
│       ├── anthropic.ts     # Anthropic Claude (API nativa)
│       ├── ollama.ts        # Ollama local
│       └── mock.ts          # modo demo sem chave de API
│   └── tools/
│       ├── fileTool.ts      # agente de leitura de arquivos + glob
│       ├── bashTool.ts      # executor de comandos shell com confirmação
│       ├── webSearch.ts     # busca DuckDuckGo
│       └── diffTool.ts      # aplicador de patches de código
├── scripts/
│   └── build-corecode.ts    # script de build dedicado (Bun bundler)
├── dist/
│   └── cli.mjs              # binário compilado self-contained
├── bin/
│   └── corecode.js          # wrapper npm bin (shebang node)
├── public/
│   ├── docs-banner.svg      # banner da documentação
│   └── icon.svg             # ícone do site
├── .env.example             # template de variáveis de ambiente
└── package.json             # @estevamsl/corecode
```

---

## Arquitetura

```
stdin → readline REPL → detectFileReferences() → readFiles()
                      → detectBashCommand()    → runBashTool()
                      → detectSlashCommand()   → handleCommand()
                      → sendToAI(provider)     → streamResponse()
                                                   ├── Groq SSE
                                                   ├── OpenAI SSE
                                                   ├── OpenRouter SSE
                                                   ├── DeepSeek SSE
                                                   ├── Mistral SSE
                                                   ├── Gemini stream
                                                   ├── Anthropic stream
                                                   └── Ollama stream
                      ← bufferResponse()
                      ← renderResponse()       ← highlighter (syntax)
                      ← processDiffs()         ← diffTool (patch apply)
```

---

## Build a partir do código-fonte

```bash
# Clone
git clone https://github.com/estevam5s/CoreCode.git
cd CoreCode

# Dependências (requer Bun ≥ 1.3)
npm install

# Build (src/corecode/main.ts → dist/cli.mjs)
bun run build

# Link global para desenvolvimento
npm link

# Execute
corecode
```

---

## Extensão VS Code

O CoreCode também está disponível como extensão oficial para o VS Code com **348+ modelos de IA** em um painel de chat completo:

```
ext install corecodecli.corecode-vscode
```

[**→ Instalar no VS Code Marketplace**](https://marketplace.visualstudio.com/items?itemName=corecodecli.corecode-vscode)

Consulte a [documentação da extensão](./corecode-vscode/readme.md) para detalhes completos.

---

## Comparação

| Ferramenta | Provedores | Open Source | Preço | Terminal | VS Code |
|---|---|---|---|---|---|
| **CoreCode** | 10+ (348+ via OpenRouter) | ✅ MIT | Grátis | ✅ nativo | ✅ extensão |
| Claude Code | Anthropic | ❌ | Pago | ✅ | ✅ |
| GitHub Copilot CLI | OpenAI | ❌ | Pago | ✅ | ✅ |
| Aider | OpenAI, Anthropic | ✅ | Grátis | ✅ | ❌ |
| Continue.dev | Vários | ✅ | Grátis | ❌ | ✅ (IDE) |

---

## Contribuindo

Pull requests são bem-vindos!

```bash
# Fork → clone → branch
git checkout -b feature/minha-funcionalidade

# Desenvolva e teste
bun run build
corecode

# Abra um PR no GitHub
```

Issues, sugestões e relatórios de bugs: [github.com/estevam5s/CoreCode/issues](https://github.com/estevam5s/CoreCode/issues)

---

## Autor

Criado por **Estevam Souza**

- GitHub: [@estevam5s](https://github.com/estevam5s)
- Site: [core-code-landing.vercel.app](https://core-code-landing.vercel.app/)
- npm: [@estevamsl/corecode](https://www.npmjs.com/package/@estevamsl/corecode)
- Projeto: [github.com/estevam5s/CoreCode](https://github.com/estevam5s/CoreCode)

---

## Licença

MIT © [Estevam Souza](https://github.com/estevam5s)

---

<div align="center">

**[⬆ Voltar ao topo](#o-que-é-o-corecode)**

Made with ❤️ by [Estevam Souza](https://github.com/estevam5s)

</div>
