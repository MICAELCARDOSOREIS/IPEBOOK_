#!/usr/bin/env bash
# Captura screenshots da web em modo memória com Chrome headless (sem Playwright).
# Uso: captura-web.sh <largura> <altura> <rota...>  → salva em /tmp/capturas-web/
set -u
LARG=${1:-1440}; ALT=${2:-1000}; shift
SAIDA=${SAIDA:-/tmp/capturas-web}
mkdir -p "$SAIDA"
for ROTA in "$@"; do
  NOME=$(echo "$ROTA" | tr '/?&=' '____')
  google-chrome --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
    --window-size="${LARG},${ALT}" --virtual-time-budget=15000 \
    --screenshot="$SAIDA/${LARG}x${ALT}${NOME}.png" "http://localhost:8082${ROTA}" >/dev/null 2>&1
  echo "$SAIDA/${LARG}x${ALT}${NOME}.png"
done
