#!/usr/bin/env bash
# Gera o APK de release (produção) independente, sem Metro e otimizado com Hermes.
# O Gradle roda desacoplado (setsid + nohup): fechar o terminal não interrompe a compilação.
#
# Uso:
#   scripts/gerar-apk-release.sh          inicia (ou mostra a compilação que já está rodando)
#   scripts/gerar-apk-release.sh status   mostra o andamento
#   scripts/gerar-apk-release.sh esperar  acompanha até terminar
#   scripts/gerar-apk-release.sh parar    interrompe a compilação
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PASTA_LOG="$RAIZ/android/build-logs"
LOG="$PASTA_LOG/apk-release.log"
PID_ARQ="$PASTA_LOG/apk-release.pid"
APK="$RAIZ/android/app/build/outputs/apk/release/app-release.apk"

rodando() {
  if [[ -f "$PID_ARQ" ]] && kill -0 "$(cat "$PID_ARQ")" 2>/dev/null; then
    return 0
  fi
  pgrep -f "gradlew assembleRelease" >/dev/null 2>&1
}

status() {
  if rodando; then
    echo "Compilando APK de release (PID $(cat "$PID_ARQ" 2>/dev/null || echo '?')). Última linha:"
    tail -n 1 "$LOG" 2>/dev/null || true
  elif grep -q "^RESULTADO=0" "$LOG" 2>/dev/null; then
    echo "APK de release pronto: $APK"
    ls -lh "$APK" 2>/dev/null || true
  elif grep -q "^RESULTADO=" "$LOG" 2>/dev/null; then
    echo "A compilação falhou. Erros:"
    grep -E "FAILURE|error:|What went wrong" -A3 "$LOG" | head -20
    return 1
  else
    echo "Nenhuma compilação em andamento."
  fi
}

case "${1:-iniciar}" in
  status) status; exit $? ;;
  parar)
    if rodando; then kill -- -"$(cat "$PID_ARQ")" 2>/dev/null || kill "$(cat "$PID_ARQ")"; echo "Compilação interrompida."; else echo "Nada rodando."; fi
    exit 0 ;;
  esperar)
    while rodando; do sleep 15; done
    status; exit $? ;;
  iniciar) ;;
  *) echo "Uso: $0 [iniciar|status|esperar|parar]"; exit 2 ;;
esac

if rodando; then
  echo "Já existe uma compilação de release em andamento."
  status
  exit 0
fi

if [[ ! -d "$RAIZ/android" ]]; then
  echo "Pasta android/ não existe. Rode antes: npx expo prebuild -p android --no-install"
  exit 1
fi

mkdir -p "$PASTA_LOG"
if [[ -x "$RAIZ/android/gradlew" ]]; then (cd "$RAIZ/android" && ./gradlew --stop >/dev/null 2>&1 || true); fi
cp "$RAIZ/google-services.json" "$RAIZ/android/app/google-services.json"

# Limpa bundle de assets de debug manual para que o assembleRelease embute o bundle de produção hermes limpo
rm -f "$RAIZ/android/app/src/main/assets/index.android.bundle"

cd "$RAIZ/android"
rm -f "$PID_ARQ"
echo "INICIADO em $(date -Iseconds)" > "$LOG"
ABIS="${APK_ABIS:-arm64-v8a,x86_64}"
WORKERS="${GRADLE_WORKERS:-2}"
JVMARGS="${GRADLE_JVMARGS:--Xmx3584m -XX:+UseG1GC -XX:MaxMetaspaceSize=512m}"

TOKEN_ARQ="$HOME/.config/ipebook/sentry-auth-token"
if [[ -z "${SENTRY_AUTH_TOKEN:-}" && -r "$TOKEN_ARQ" ]]; then export SENTRY_AUTH_TOKEN="$(cat "$TOKEN_ARQ")"; fi
export SENTRY_DISABLE_AUTO_UPLOAD=true

setsid nohup bash -c '
  echo $$ > "$1"
  cd "$2/android"
  export SENTRY_DISABLE_AUTO_UPLOAD=true
  echo "--- Compilando APK Release (Gradle assembleRelease) ---"
  nice -n 19 ionice -c 3 ./gradlew assembleRelease --console=plain --max-workers="$3" -Dorg.gradle.jvmargs="$4" -PreactNativeArchitectures="$5"
  echo "RESULTADO=$?"
' _ "$PID_ARQ" "$RAIZ" "$WORKERS" "$JVMARGS" "$ABIS" >> "$LOG" 2>&1 < /dev/null &

for _ in 1 2 3 4 5 6 7 8 9 10; do [[ -s "$PID_ARQ" ]] && break; sleep 0.3; done
echo "Compilação do APK de release iniciada em segundo plano (PID $(cat "$PID_ARQ"))."
echo "Andamento: $0 status   |   Log: $LOG"
