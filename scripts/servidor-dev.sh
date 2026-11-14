#!/usr/bin/env bash
# Inicia o servidor de desenvolvimento do Expo com heap suficiente para o Metro.
#
# `expo start` atende Android e web no mesmo processo Node. Quando a web abre com o app nativo
# conectado, o Metro mantém os dois grafos de módulos na memória (web estática com SSR + Android)
# e o Node estoura o padrão de ~2 GB desta máquina, morrendo com SIGABRT:
#   FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
# Por isso o padrão aqui é 4 GB. Para usar outro valor, definir NODE_OPTIONS no ambiente:
#   NODE_OPTIONS=--max-old-space-size=6144 npm start
#
# Uso:
#   npm start                  servidor para o app nativo e a web
#   npm run web                o mesmo servidor, abrindo a web
#   npm start -- --clear       limpando o cache do Metro (as flags precisam vir depois de `--`)
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ"

node_opts="${NODE_OPTIONS:-}"
if [[ "$node_opts" != *"--max-old-space-size"* ]]; then
  node_opts="${node_opts:+$node_opts }--max-old-space-size=4096"
fi
if [[ "$node_opts" != *"metro-sem-vazamento-ssr.cjs"* ]]; then
  node_opts="${node_opts:+$node_opts }--require=$RAIZ/scripts/metro-sem-vazamento-ssr.cjs"
fi
export NODE_OPTIONS="$node_opts"

tem_max_workers=false
for arg in "$@"; do
  if [[ "$arg" == "--max-workers" || "$arg" == --max-workers=* ]]; then
    tem_max_workers=true
    break
  fi
done

if [[ "$tem_max_workers" == false ]]; then
  exec ./node_modules/.bin/expo start --max-workers "${EXPO_METRO_MAX_WORKERS:-4}" "$@"
fi

exec ./node_modules/.bin/expo start "$@"
