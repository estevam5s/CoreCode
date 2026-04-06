#!/usr/bin/env bash
# ================================================================
# CORECODE — Setup & Launch
# ================================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BOLD='\033[1m'; GRAY='\033[0;90m'; GREEN='\033[0;32m'; RESET='\033[0m'

echo -e "\n${BOLD}============================================================${RESET}"
echo -e "${BOLD}  CORECODE — Setup & Launch${RESET}"
echo -e "${BOLD}============================================================${RESET}\n"

# .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GRAY}[1/3] .env criado. Editando...${RESET}"
  sleep 1; "${EDITOR:-nano}" .env
else
  echo -e "${GREEN}[1/3] .env ok${RESET}"
fi

# build
echo -e "${GRAY}[2/3] Build...${RESET}"
bun run build
echo -e "${GREEN}[2/3] Build ok → dist/cli.mjs${RESET}"

# link
echo -e "${GRAY}[3/3] Linkando 'corecode' globalmente...${RESET}"
npm link --force 2>/dev/null || sudo npm link --force
echo -e "${GREEN}[3/3] Comando 'corecode' disponível${RESET}\n"

exec corecode
