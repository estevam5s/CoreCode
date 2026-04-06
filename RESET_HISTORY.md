# reset-history.sh

Script utilitário para remover **todo o histórico de commits** de um repositório Git sem apagar nenhuma alteração no código.

O resultado é um repositório limpo com um único commit inicial contendo o estado atual do projeto.

---

## Por que usar?

- Limpar histórico de desenvolvimento antes de tornar um repositório público
- Remover commits com informações sensíveis (senhas, tokens acidentais)
- Iniciar um "capítulo novo" do projeto sem bagagem de histórico
- Reduzir o tamanho do repositório removendo objetos Git acumulados

> **Atenção:** esta operação é **irreversível**. Todo o histórico de commits anterior será perdido permanentemente. O código em si **não é alterado**.

---

## Pré-requisitos

- Git instalado e configurado
- Repositório com pelo menos um remote configurado (ex: `origin`)
- Permissão de **force push** no repositório remoto

---

## Instalação

O script já está na raiz do projeto. Dê permissão de execução uma única vez:

```sh
chmod +x reset-history.sh
```

---

## Uso

### Forma mais simples

```sh
sh reset-history.sh
```

Usa os valores padrão:
- Branch: `main`
- Remote: `origin`
- Mensagem: `chore: initial commit`

---

### Com flags

| Flag | Atalho | Descrição | Padrão |
|------|--------|-----------|--------|
| `--message` | `-m` | Mensagem do commit inicial | `chore: initial commit` |
| `--branch` | `-b` | Branch alvo | `main` |
| `--remote` | `-r` | Nome do remote | `origin` |

---

## Exemplos de uso

```sh
# Padrão — usa defaults
sh reset-history.sh

# Com mensagem customizada
sh reset-history.sh --message "init: CoreCode v1.0.0"

# Branch e remote específicos
sh reset-history.sh --branch master --remote upstream

# Tudo junto com atalhos
sh reset-history.sh -m "feat: initial public release" -b main -r origin
```

---

## O que o script faz internamente (passo a passo)

```
1. Verifica se está dentro de um repositório Git (.git existe)
2. Salva a URL do remote antes de apagar
3. Remove a pasta .git completamente
4. Inicializa um novo repositório Git limpo
5. Adiciona todos os arquivos (git add -A)
6. Cria um único commit inicial com a mensagem escolhida
7. Reconecta ao remote original
8. Envia com force push (--force) para sobrescrever o histórico remoto
```

---

## Formatos de mensagem de commit

### Conventional Commits (recomendado)

O padrão [Conventional Commits](https://www.conventionalcommits.org) é o mais usado em projetos modernos. O formato é:

```
<tipo>(<escopo opcional>): <descrição curta>
```

#### Tipos disponíveis

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `init` | Commit inicial de um projeto | `init: CoreCode CLI` |
| `feat` | Nova funcionalidade | `feat: adicionar autocomplete de comandos` |
| `fix` | Correção de bug | `fix: corrigir crash ao usar /model sem args` |
| `chore` | Tarefas de manutenção, configs | `chore: atualizar dependências` |
| `docs` | Alterações em documentação | `docs: adicionar guia de instalação` |
| `style` | Formatação, espaços (sem lógica) | `style: formatar código com prettier` |
| `refactor` | Refatoração sem nova feature ou fix | `refactor: extrair lógica de providers` |
| `perf` | Melhoria de performance | `perf: reduzir tempo de inicialização` |
| `test` | Adicionar ou corrigir testes | `test: adicionar testes para /exit` |
| `build` | Sistema de build, dependências | `build: migrar para bun` |
| `ci` | Configuração de CI/CD | `ci: adicionar workflow de testes` |
| `revert` | Reverter commit anterior | `revert: feat: autocomplete (quebrou prod)` |

---

### Para commit inicial — qual usar?

```sh
# Mais semântico e descritivo (recomendado)
init: CoreCode v0.2.4

# Com escopo
init(cli): CoreCode CLI v0.2.4

# Quando já tem features prontas
feat: initial release — CoreCode CLI

# Padrão do GitHub (simples)
Initial commit

# Para projetos com versão definida
release: v1.0.0

# Para repositórios que foram limpos
chore: clean repository history
```

---

### Escopos úteis

O escopo é opcional e fica entre parênteses após o tipo:

```sh
feat(auth): adicionar login com Supabase
fix(cli): corrigir renderização do dropdown
docs(api): documentar rotas de pagamento
chore(deps): atualizar @supabase/supabase-js para v2
refactor(providers): separar OpenRouter em arquivo próprio
```

---

### Commits com corpo e rodapé

Para commits mais detalhados, use múltiplas linhas:

```
feat(autocomplete): adicionar suporte a 348 modelos OpenRouter

Implementa dropdown interativo ao digitar '/' no terminal.
Navega com ↑↓, seleciona com Enter, cancela com Esc.

Models carregados de: src/corecode/openrouter-models.ts
Refs: #42
```

---

### Commits com breaking change

```
feat!: remover suporte ao provider Ollama local

BREAKING CHANGE: o provider 'ollama' foi removido na v1.0.
Use 'openrouter' com modelos locais via LM Studio.
```

---

### Exemplos reais para o CoreCode

```sh
# Reset de histórico
sh reset-history.sh -m "init: CoreCode v0.2.4"

# Nova versão
sh reset-history.sh -m "release: v1.0.0 — stable"

# Após limpeza de dados sensíveis
sh reset-history.sh -m "chore: remove sensitive data from history"

# Início de projeto open source
sh reset-history.sh -m "feat: initial open source release"

# Com versão e data
sh reset-history.sh -m "init: CoreCode CLI — April 2026"
```

---

## Verificar após execução

```sh
# Confirmar que só há 1 commit
git log --oneline

# Confirmar que o código está intacto
git status

# Confirmar que o remote está correto
git remote -v
```

---

## Reverter (se necessário)

> Não é possível reverter automaticamente após o script rodar. Por isso, se quiser preservar o histórico original, faça um backup antes:

```sh
# Backup antes de rodar o script
cp -r .git .git-backup

# Se precisar restaurar
rm -rf .git
mv .git-backup .git
git push origin main --force
```

---

## Compatibilidade

| Sistema | Suportado |
|---------|-----------|
| macOS | ✓ |
| Linux | ✓ |
| Windows (Git Bash) | ✓ |
| Windows (WSL) | ✓ |
| Windows (CMD/PowerShell) | ✗ — use Git Bash ou WSL |
