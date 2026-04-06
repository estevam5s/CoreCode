#!/usr/bin/env sh
set -e

PACKAGE="@estevamsl/corecode"
MIN_NODE=20

# ── Colors ────────────────────────────────────────────────────────────────────
ORANGE='\033[38;5;208m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

print_banner() {
  printf "\n"
  printf "${ORANGE}  ██████╗ ██████╗ ██████╗ ███████╗${RESET}\n"
  printf "${ORANGE} ██╔════╝██╔═══██╗██╔══██╗██╔════╝${RESET}\n"
  printf "${ORANGE} ██║     ██║   ██║██████╔╝█████╗  ${RESET}\n"
  printf "${ORANGE} ██║     ██║   ██║██╔══██╗██╔══╝  ${RESET}\n"
  printf "${ORANGE} ╚██████╗╚██████╔╝██║  ██║███████╗${RESET}\n"
  printf "${ORANGE}  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝${RESET}\n"
  printf "\n"
  printf " ${DIM}Any model. Every tool. Zero limits.${RESET}\n"
  printf "\n"
}

# ── Check command exists ──────────────────────────────────────────────────────
need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf "${RED}✗ '$1' not found.${RESET} %s\n" "$2"
    exit 1
  fi
}

# ── Node.js version check ─────────────────────────────────────────────────────
check_node() {
  need node "Please install Node.js ${MIN_NODE}+ from https://nodejs.org"
  NODE_VER=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
  if [ "$NODE_VER" -lt "$MIN_NODE" ] 2>/dev/null; then
    printf "${RED}✗ Node.js ${MIN_NODE}+ required (found v%s).${RESET}\n" "$NODE_VER"
    printf "  Download: https://nodejs.org\n"
    exit 1
  fi
}

# ── Detect package manager ────────────────────────────────────────────────────
detect_pm() {
  if command -v bun >/dev/null 2>&1; then
    PM="bun"
    INSTALL_CMD="bun add -g"
  elif command -v npm >/dev/null 2>&1; then
    PM="npm"
    INSTALL_CMD="npm install -g"
  else
    printf "${RED}✗ No package manager found.${RESET} Install npm or bun.\n"
    exit 1
  fi
}

# ── Tracking (fire-and-forget — never blocks or fails the install) ────────────
track_install() {
  curl -s --max-time 5 \
    -A "CoreCode-installer/1.0 (sh)" \
    "https://core-code-landing.vercel.app/api/track-curl" \
    >/dev/null 2>&1 || true
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  print_banner

  # Ping analytics endpoint in background (non-blocking)
  track_install &

  printf " Checking requirements...\n"
  check_node
  detect_pm
  printf " ${GREEN}✓${RESET} Node.js v%s  ${DIM}(using %s)${RESET}\n\n" "$(node --version | tr -d v)" "$PM"

  printf " Installing ${ORANGE}%s${RESET}...\n" "$PACKAGE"
  $INSTALL_CMD "$PACKAGE"

  printf "\n"
  printf " ${GREEN}✓ CoreCode installed successfully!${RESET}\n\n"
  printf " ${DIM}Run:${RESET} ${ORANGE}corecode${RESET}\n"
  printf "\n"
}

main
