#!/usr/bin/env sh
# ─────────────────────────────────────────────────────────────────────────────
# reset-history.sh
#
# Remove TODO o histórico de commits do repositório git atual,
# sem apagar nenhuma alteração no código.
#
# O resultado é um repositório limpo com um único commit inicial,
# e o código fica exatamente como está agora.
#
# Uso:
#   sh reset-history.sh
#   sh reset-history.sh --message "minha mensagem de commit"
#   sh reset-history.sh --branch main --remote origin
# ─────────────────────────────────────────────────────────────────────────────
set -e

# ── Defaults ──────────────────────────────────────────────────────────────────
BRANCH="main"
REMOTE="origin"
COMMIT_MSG="chore: initial commit"

# ── Parse args ────────────────────────────────────────────────────────────────
while [ $# -gt 0 ]; do
  case "$1" in
    --message|-m) COMMIT_MSG="$2"; shift 2 ;;
    --branch|-b)  BRANCH="$2";     shift 2 ;;
    --remote|-r)  REMOTE="$2";     shift 2 ;;
    *) shift ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────────────────
ORANGE='\033[38;5;208m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

printf "\n"
printf " ${ORANGE}●${RESET} Removendo histórico de commits...\n"
printf " ${DIM}Branch: ${BRANCH}  Remote: ${REMOTE}${RESET}\n\n"

# ── Confirmar que estamos num repo git ───────────────────────────────────────
if [ ! -d ".git" ]; then
  printf " ${RED}✗ Não é um repositório git. Execute dentro da pasta do projeto.${RESET}\n"
  exit 1
fi

# ── Salvar a URL do remote antes de apagar o .git ────────────────────────────
REMOTE_URL=$(git remote get-url "$REMOTE" 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  printf " ${RED}✗ Remote '${REMOTE}' não encontrado.${RESET}\n"
  exit 1
fi

printf " ${DIM}Remote URL: ${REMOTE_URL}${RESET}\n\n"

# ── Remover o .git e recriar ──────────────────────────────────────────────────
printf " ${ORANGE}1/5${RESET} Removendo .git...\n"
rm -rf .git

printf " ${ORANGE}2/5${RESET} Inicializando novo repositório...\n"
git init -b "$BRANCH"

printf " ${ORANGE}3/5${RESET} Adicionando todos os arquivos...\n"
git add -A

printf " ${ORANGE}4/5${RESET} Criando commit inicial...\n"
git commit -m "$COMMIT_MSG"

printf " ${ORANGE}5/5${RESET} Conectando ao remote e enviando (force push)...\n"
git remote add "$REMOTE" "$REMOTE_URL"
git push "$REMOTE" "$BRANCH" --force

printf "\n"
printf " ${GREEN}✓ Histórico removido com sucesso!${RESET}\n"
printf " ${DIM}Repositório agora tem 1 commit em ${BRANCH}${RESET}\n"
printf " ${DIM}Remote: ${REMOTE_URL}${RESET}\n\n"
