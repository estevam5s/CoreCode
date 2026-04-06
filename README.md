<div align="center">

```
  ██████╗ ██████╗ ██████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██║     ██║   ██║██████╔╝█████╗  ██║     ██║   ██║██║  ██║█████╗
 ██║     ██║   ██║██╔══██╗██╔══╝  ██║     ██║   ██║██║  ██║██╔══╝
 ╚██████╗╚██████╔╝██║  ██║███████╗╚██████╗╚██████╔╝██████╔╝███████╗
  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═════╝╚══════╝
```

**ADVANCED MULTI-MODEL AI CLI**

![Version](https://img.shields.io/badge/version-0.1.7-white?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D20-white?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)
![Providers](https://img.shields.io/badge/providers-7-white?style=flat-square)

</div>

---

## O que é o CoreCode?

CoreCode é uma CLI de agente de código multi-model e multi-provider. Rode modelos de IA direto no seu terminal com suporte a **OpenAI, Groq (grátis), Gemini, Anthropic, Ollama** e qualquer API OpenAI-compatible — tudo via comandos simples como `/model` e `/provider`.

---

## Início rápido

### 1. Instalar

```bash
git clone https://github.com/SEU_USUARIO/CoreCode.git
cd CoreCode
npm install
bun run build
npm link
```

### 2. Configurar (escolha um provider)

```bash
cp .env.example .env
```

Edite `.env` e adicione sua chave:

| Provider | Variável | Custo | Link |
|---|---|---|---|
| **Groq** | `GROQ_API_KEY` | **Grátis** | [console.groq.com](https://console.groq.com) |
| Gemini | `GEMINI_API_KEY` | Grátis (tier) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| OpenAI | `OPENAI_API_KEY` | Pago | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | `ANTHROPIC_API_KEY` | Pago | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| Ollama | *(sem chave)* | **Grátis local** | [ollama.ai](https://ollama.ai) |

### 3. Executar

```bash
corecode
```

Ou use o script de setup automático:

```bash
./start-corecode.sh
```

---

## Comandos

```
/help                     Mostra todos os comandos
/status                   Provider atual, modelo e histórico

/model                    Mostra o modelo ativo
/model <nome>             Troca o modelo
/model list               Lista modelos do provider atual
/model list --all         Busca todos os modelos via API

/provider                 Mostra o provider ativo
/provider <nome>          Troca de provider (e ajusta modelo padrão)
/provider list            Lista providers e quais são gratuitos

/add <provider> <model>   Adiciona modelo personalizado
/system <prompt>          Define o system prompt
/system show              Mostra o system prompt atual

/history                  Mostra histórico da conversa
/clear                    Limpa o histórico
/exit  /quit              Sai do CoreCode
```

---

## Providers e modelos

### Groq — gratuito, ultra-rápido
```bash
/provider groq
/model llama-3.3-70b-versatile    # recomendado
/model llama-3.1-8b-instant       # mais rápido
/model mixtral-8x7b-32768
/model gemma2-9b-it
/model deepseek-r1-distill-llama-70b
```
> Obtenha sua chave grátis em [console.groq.com](https://console.groq.com) (sem cartão de crédito).

### Gemini — tier gratuito disponível
```bash
/provider gemini
/model gemini-2.0-flash           # recomendado
/model gemini-1.5-pro
/model gemini-2.0-pro-exp
```

### OpenAI
```bash
/provider openai
/model gpt-4o
/model gpt-4o-mini
/model o3-mini
```

### Anthropic
```bash
/provider anthropic
/model claude-sonnet-4-6
/model claude-opus-4-6
/model claude-haiku-4-5-20251001
```

### Ollama — 100% local, sem internet
```bash
# instale e rode: ollama serve
/provider ollama
/model qwen2.5-coder:7b
/model llama3.2:3b
/model deepseek-coder:6.7b
```

### Mock — demo sem chave
```bash
/provider mock    # funciona sem nenhuma API key
```

---

## Configuração avançada

### Trocar provider em tempo real
```
[openai/gpt-4o] › /provider groq
Provider: groq | Modelo: llama-3.3-70b-versatile

[groq/llama-3.3-70b-versatile] › /model gemma2-9b-it
Modelo alterado para: gemma2-9b-it
```

### Adicionar modelo customizado
```
/add openai ft:gpt-4o:minha-empresa:v1
/add ollama phi4:latest
```

### System prompt personalizado
```
/system Você é um especialista em Rust. Responda sempre com exemplos de código.
/system show
```

### Provider OpenAI-compatible (LM Studio, vLLM, etc.)
```bash
# .env
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_API_KEY=qualquer-coisa
CORECODE_DEFAULT_PROVIDER=openai-compatible
```

---

## Estrutura do projeto

```
CoreCode/
├── src/corecode/
│   ├── main.ts              # entrypoint
│   ├── repl.ts              # REPL loop
│   ├── commands.ts          # slash commands
│   ├── router.ts            # roteamento de providers
│   ├── state.ts             # estado da sessão
│   ├── banner.ts            # logo ASCII
│   ├── welcome.ts           # info de inicialização
│   ├── setup-wizard.ts      # wizard de primeiro uso
│   └── providers/
│       ├── openai.ts        # OpenAI + OpenAI-compatible
│       ├── groq.ts          # Groq (OpenAI-compat)
│       ├── gemini.ts        # Google Gemini
│       ├── anthropic.ts     # Anthropic Claude
│       ├── ollama.ts        # Ollama local
│       └── mock.ts          # Demo sem API key
├── scripts/
│   └── build-corecode.ts    # build script dedicado
├── dist/cli.mjs             # binário compilado
├── bin/corecode             # wrapper de execução
├── .env.example             # template de variáveis
└── start-corecode.sh        # script de setup & launch
```

---

## Build

```bash
bun run build        # build rápido (REPL próprio)
bun run build:full   # build completo (base openclaude)
```

---

## Licença

MIT
