#!/usr/bin/env bash
# ================================================================
# CORECODE — Setup & Launch
# Executa: build, link global, copia .env e abre a CLI
# ================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
GRAY='\033[0;90m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}============================================================${RESET}"
echo -e "${BOLD}  CORECODE — Setup & Launch${RESET}"
echo -e "${BOLD}============================================================${RESET}"
echo ""

# ── 1. .env ──────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GRAY}[1/4] .env criado a partir de .env.example${RESET}"
  echo -e "${GRAY}      → Edite .env e preencha suas chaves antes de continuar.${RESET}"
  echo ""
  echo -e "      Abrindo .env para edição... (Ctrl+C para cancelar)"
  sleep 2
  "${EDITOR:-nano}" .env
else
  echo -e "${GREEN}[1/4] .env já existe — ok${RESET}"
fi

# ── 2. Build ─────────────────────────────────────────────────────
echo -e "${GRAY}[2/4] Build...${RESET}"
if command -v bun &>/dev/null; then
  bun run build
else
  npm run build
fi
echo -e "${GREEN}[2/4] Build concluído → dist/cli.mjs${RESET}"

# ── 3. npm link ──────────────────────────────────────────────────
echo -e "${GRAY}[3/4] Registrando comando global 'corecode'...${RESET}"
npm link --force 2>/dev/null || sudo npm link --force
echo -e "${GREEN}[3/4] Comando 'corecode' disponível globalmente${RESET}"

# ── 4. Launch ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[4/4] Iniciando CoreCode...${RESET}"
echo -e "${BOLD}============================================================${RESET}"
echo ""

exec corecode
