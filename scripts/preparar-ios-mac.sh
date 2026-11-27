#!/usr/bin/env bash
set -euo pipefail

# Prepara o projeto IpêBook para compilação iOS no macOS (Xcode + CocoaPods).
# Uso: npm run ios:preparar [-- --limpar]

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

LIMPAR=false
for arg in "$@"; do
  if [[ "$arg" == "--limpar" ]]; then
    LIMPAR=true
  fi
done

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Erro: este script deve ser executado no macOS (sistema detectado: $(uname -s))."
  exit 1
fi

for cmd in node npm xcodebuild pod; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Erro: '$cmd' não encontrado no PATH."
    case "$cmd" in
      xcodebuild) echo "Instale o Xcode pela App Store e execute: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer" ;;
      pod) echo "Instale o CocoaPods: brew install cocoapods (ou sudo gem install cocoapods)" ;;
      node|npm) echo "Instale Node.js LTS (ex.: brew install node@22)" ;;
    esac
    exit 1
  fi
done

if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
  echo "Aviso: .env criado a partir de .env.example — preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY antes de rodar."
fi

if [[ "$LIMPAR" == "true" || ! -d "node_modules" ]]; then
  echo "Instalando dependências Node (npm ci)..."
  npm ci
fi

if [[ "$LIMPAR" == "true" && -d "ios" ]]; then
  echo "Removendo pasta ios/ anterior..."
  rm -rf ios
fi

echo "Gerando projeto nativo iOS (expo prebuild)..."
npx expo prebuild --platform ios --no-install

echo "Instalando dependências nativas iOS (pod install)..."
(cd ios && pod install)

echo ""
echo "Ambiente iOS pronto no Mac."
echo "Próximos passos:"
echo "  - Simulador: npm run ios"
echo "  - Aparelho físico: npm run ios:device"
echo "  - Xcode: open ios/Ipebook.xcworkspace"
