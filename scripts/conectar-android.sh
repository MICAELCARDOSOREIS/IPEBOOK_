#!/usr/bin/env bash
# Abre o projeto no aparelho Android físico pelo cabo USB, sem depender da rede local.
#
# O app de desenvolvimento baixa o bundle do servidor Metro. Quando o celular não alcança o
# computador — VPN ativa no aparelho, isolamento de clientes no roteador ou outra rede — o dev
# launcher abre, tenta carregar e não sai disso (tela branca ou "Bundling" parado), e o Metro
# nem registra pedido do aparelho. O `adb reverse` usa o próprio cabo: a porta do Metro no
# computador passa a existir em 127.0.0.1 no aparelho.
#
# Uso:
#   scripts/conectar-android.sh            configura o túnel e abre o projeto
#   scripts/conectar-android.sh parar      remove o túnel
#
# Variáveis: PORTA (padrão 8081) e APARELHO (número de série, quando há mais de um conectado).
set -euo pipefail

PORTA="${PORTA:-8081}"
ESQUEMA="exp+ipebook"
APP="com.ipebook.app"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb não encontrado no PATH." >&2
  exit 1
fi

ADB=(adb)
if [[ -n "${APARELHO:-}" ]]; then
  ADB+=(-s "$APARELHO")
fi

if ! "${ADB[@]}" get-state >/dev/null 2>&1; then
  echo "Nenhum aparelho disponível: ligue o cabo e autorize a depuração USB." >&2
  exit 1
fi

if [[ "${1:-}" == "parar" ]]; then
  "${ADB[@]}" reverse --remove "tcp:$PORTA" 2>/dev/null || true
  echo "Túnel da porta $PORTA removido."
  exit 0
fi

if command -v curl >/dev/null 2>&1; then
  if ! curl -fsS --max-time 3 "http://127.0.0.1:$PORTA/status" 2>/dev/null | grep -q "packager-status:running"; then
    echo "O servidor do Expo não está respondendo em http://127.0.0.1:$PORTA." >&2
    echo "Inicie em outro terminal com: npm start" >&2
    exit 1
  fi
fi

"${ADB[@]}" reverse "tcp:$PORTA" "tcp:$PORTA" >/dev/null
echo "✔ Túnel USB ativo: 127.0.0.1:$PORTA no aparelho → porta $PORTA do computador"

"${ADB[@]}" shell am start -a android.intent.action.VIEW \
  -d "$ESQUEMA://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A$PORTA" >/dev/null
echo "✔ $APP abrindo o projeto pelo túnel; aguarde o bundle do Metro."
