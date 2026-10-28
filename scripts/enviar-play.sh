#!/usr/bin/env bash
# Envia o .aab mais recente de android/build-logs/ para a Google Play via EAS Submit.
# Uso:
#   scripts/enviar-play.sh            envia o .aab mais recente
#   scripts/enviar-play.sh <arquivo>  envia um .aab específico
# A chave da conta de serviço fica fora do Git, em ~/.config/ipebook/play-service-account.json
# (ou no caminho da variável PLAY_SERVICE_ACCOUNT). A faixa e o status vêm de eas.json (submit.production).
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
CHAVE_ORIGEM="${PLAY_SERVICE_ACCOUNT:-$HOME/.config/ipebook/play-service-account.json}"
CHAVE_PROJETO="$RAIZ/credenciais/play-service-account.json"

if [ ! -f "$CHAVE_ORIGEM" ]; then
  echo "Chave da conta de serviço não encontrada em $CHAVE_ORIGEM" >&2
  echo "Baixe o JSON no Google Cloud e salve nesse caminho (veja docs/loja/publicacao-terminal.md)." >&2
  exit 1
fi
mkdir -p "$RAIZ/credenciais"
ln -sf "$CHAVE_ORIGEM" "$CHAVE_PROJETO"

AAB="${1:-$(ls -t "$RAIZ"/android/build-logs/*.aab 2>/dev/null | head -1 || true)}"
if [ -z "$AAB" ] || [ ! -f "$AAB" ]; then
  echo "Nenhum .aab encontrado. Gere um com: npm run aab:local" >&2
  exit 1
fi

echo "Enviando $(basename "$AAB") para a Google Play..."
cd "$RAIZ"
npx -y eas-cli submit --platform android --profile production --path "$AAB" --non-interactive --wait
