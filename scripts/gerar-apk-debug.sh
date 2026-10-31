#!/usr/bin/env bash
# Gera o APK de debug sem depender do terminal ou da sessão de IA que o iniciou.
# O Gradle roda desacoplado (setsid + nohup): fechar o terminal ou o Claude Code não interrompe a compilação.
#
# Uso:
#   scripts/gerar-apk-debug.sh          inicia (ou mostra a compilação que já está rodando)
#   scripts/gerar-apk-debug.sh status   mostra o andamento
#   scripts/gerar-apk-debug.sh esperar  acompanha até terminar
#   scripts/gerar-apk-debug.sh parar    interrompe a compilação
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PASTA_LOG="$RAIZ/android/build-logs"
LOG="$PASTA_LOG/apk-debug.log"
PID_ARQ="$PASTA_LOG/apk-debug.pid"
APK="$RAIZ/android/app/build/outputs/apk/debug/app-debug.apk"

rodando() { [[ -f "$PID_ARQ" ]] && kill -0 "$(cat "$PID_ARQ")" 2>/dev/null; }

status() {
  if rodando; then
    echo "Compilando (PID $(cat "$PID_ARQ")). Última linha:"
    tail -n 1 "$LOG"
  elif grep -q "^RESULTADO=0" "$LOG" 2>/dev/null; then
    echo "APK pronto: $APK"
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
  echo "Já existe uma compilação em andamento."
  status
  exit 0
fi

if [[ ! -d "$RAIZ/android" ]]; then
  echo "Pasta android/ não existe. Rode antes: npx expo prebuild -p android --no-install"
  exit 1
fi

mkdir -p "$PASTA_LOG"
# Mantém o google-services.json da raiz e o da pasta nativa iguais.
cp "$RAIZ/google-services.json" "$RAIZ/android/app/google-services.json"
mkdir -p "$RAIZ/android/app/src/main/assets"

cd "$RAIZ/android"
rm -f "$PID_ARQ"
echo "INICIADO em $(date -Iseconds)" > "$LOG"
# ABIs suportadas: compila arm64-v8a (celular real) e x86_64 (Waydroid/emulador) por padrão
ABIS="${APK_ABIS:-arm64-v8a,x86_64}"
WORKERS="${GRADLE_WORKERS:-2}"
JVMARGS="${GRADLE_JVMARGS:--Xmx1536m -XX:+UseG1GC -XX:MaxMetaspaceSize=512m}"

setsid nohup bash -c '
  echo $$ > "$1"
  cd "$2"
  echo "--- 1/2: Gerando bundle JavaScript atualizado ---"
  nice -n 19 ionice -c 3 npx expo export:embed \
    --entry-file node_modules/expo-router/entry.js \
    --platform android \
    --dev false \
    --reset-cache \
    --bundle-output "$2/android/app/src/main/assets/index.android.bundle" \
    --assets-dest "$2/android/app/src/main/res"
  echo "--- 2/2: Compilando APK nativo (Gradle assembleDebug) ---"
  cd "$2/android"
  nice -n 19 ionice -c 3 ./gradlew assembleDebug --console=plain --max-workers="$3" -Dorg.gradle.jvmargs="$4" -PreactNativeArchitectures="$5"
  echo "RESULTADO=$?"
' _ "$PID_ARQ" "$RAIZ" "$WORKERS" "$JVMARGS" "$ABIS" >> "$LOG" 2>&1 < /dev/null &
for _ in 1 2 3 4 5 6 7 8 9 10; do [[ -s "$PID_ARQ" ]] && break; sleep 0.3; done
echo "Compilação iniciada em segundo plano (PID $(cat "$PID_ARQ"))."
echo "Andamento: $0 status   |   Log: $LOG"
