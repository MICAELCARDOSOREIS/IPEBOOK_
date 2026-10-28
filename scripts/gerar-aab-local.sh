#!/usr/bin/env bash
# Gera o App Bundle (.aab) de produção na própria máquina, assinado com a chave do EAS (serve para a Play Store),
# sem gastar a cota de builds na nuvem. Roda desacoplado (setsid + nohup): não trava o terminal nem a sessão de IA.
#
# Uso:
#   scripts/gerar-aab-local.sh [perfil]   inicia (perfil padrão: production)
#   scripts/gerar-aab-local.sh status     mostra o andamento ou o arquivo gerado
#   scripts/gerar-aab-local.sh parar      interrompe
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PASTA="$RAIZ/android/build-logs"
LOG="$PASTA/aab-local.log"
PID_ARQ="$PASTA/aab-local.pid"

rodando() { [[ -f "$PID_ARQ" ]] && kill -0 "$(cat "$PID_ARQ")" 2>/dev/null; }

status() {
  if rodando; then
    echo "Gerando o .aab (PID $(cat "$PID_ARQ")). Última linha:"
    tail -n 1 "$LOG"
  elif grep -q "^RESULTADO=0" "$LOG" 2>/dev/null; then
    echo "Pronto: $(grep '^ARQUIVO=' "$LOG" | cut -d= -f2-)"
  elif grep -q "^RESULTADO=" "$LOG" 2>/dev/null; then
    echo "Falhou. Trechos do log ($LOG):"
    grep -iE "error|failed|falh" "$LOG" | tail -15
    return 1
  else
    echo "Nenhuma geração em andamento."
  fi
}

case "${1:-production}" in
  status) status; exit $? ;;
  parar)
    if rodando; then kill -- -"$(cat "$PID_ARQ")" 2>/dev/null || kill "$(cat "$PID_ARQ")"; echo "Interrompido."; else echo "Nada rodando."; fi
    exit 0 ;;
esac
PERFIL="${1:-production}"

if rodando; then
  echo "Já existe uma geração em andamento."
  status
  exit 0
fi

mkdir -p "$PASTA"
SAIDA="$PASTA/ipebook-$PERFIL-$(date +%Y%m%d-%H%M).aab"
rm -f "$PID_ARQ"
cd "$RAIZ"
# O google-services.json não está no Git, e o build local copia só o que o Git conhece; o app.config.js lê o
# caminho desta variável (na nuvem, a mesma variável vem do EAS como arquivo secreto).
# Pasta temporária própria: o build local precisa de vários GB e o /tmp costuma ser pequeno (tmpfs).
mkdir -p "$PASTA/tmp"
setsid nohup env GOOGLE_SERVICES_JSON="$RAIZ/google-services.json" EAS_LOCAL_BUILD_WORKINGDIR="$PASTA/tmp/eas-$$" \
  bash -c 'echo $$ > "$1"; npx -y eas-cli build -p android --profile "$2" --local --non-interactive --output "$3"; r=$?; echo "ARQUIVO=$3"; echo "RESULTADO=$r"' \
  _ "$PID_ARQ" "$PERFIL" "$SAIDA" > "$LOG" 2>&1 < /dev/null &
for _ in 1 2 3 4 5 6 7 8 9 10; do [[ -s "$PID_ARQ" ]] && break; sleep 0.3; done
echo "Geração do .aab ($PERFIL) iniciada em segundo plano (PID $(cat "$PID_ARQ"))."
echo "Andamento: npm run aab:local:status   |   Log: $LOG"
