# CoreCode

CoreCode é uma CLI avançada de agente de código com suporte multi-provider e multi-modelo.

## Objetivos do projeto

- CLI própria com identidade visual CoreCode
- Banner preto e branco no terminal
- Suporte a modelos avançados
- Compatibilidade com OpenAI-compatible APIs
- Suporte a Gemini, Codex, GitHub Models, Ollama e outros
- Fluxo terminal-first para prompts, tools, agentes e streaming

## Instalação

```bash
npm install
bun run build
npm link
corecode
```

## Configuração

Copie `.env.example` para `.env` e preencha suas credenciais:

```bash
cp .env.example .env
```

## Execução

```bash
bun run build
node dist/cli.mjs
```

ou, após `npm link`:

```bash
corecode
```

## Providers suportados

| Provider       | Variável de ambiente  |
|----------------|-----------------------|
| OpenAI         | OPENAI_API_KEY        |
| Gemini         | GEMINI_API_KEY        |
| Codex/GitHub   | GITHUB_TOKEN          |
| Ollama (local) | OLLAMA_BASE_URL       |
| OpenAI-compat  | OPENAI_BASE_URL       |
