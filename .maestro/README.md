# Fluxos E2E Nativos Android (Maestro)

Este diretório reúne os fluxos declarativos do **Maestro** (`appId: com.ipebook.app`) voltados aos recursos de hardware e integrações nativas do Android que não são exercitáveis na suíte E2E Web ([`tests/e2e/`](../tests/e2e/run.mjs)):

- `01-onboarding-e-catalogo.yaml`: primeiro acesso, onboarding, diálogo explicativo de notificações (`Avisos no seu celular`) e abertura do catálogo.
- `02-login-google-e-sessao.yaml`: acionamento do fluxo nativo **Continuar com Google** (Google Play Services).
- `03-anunciar-isbn-camera.yaml`: leitor de código de barras **ISBN pela câmera** e fluxo de permissão de fotos (`Fotos do seu livro`).
- `04-entrega-qr-e-notificacoes.yaml`: alternância câmera **QR Code** / código manual na entrega presencial.

## Pré-requisitos para execução

1. Aparelho Android físico com Depuração USB ativa (ou Waydroid via `scripts/conectar-waydroid.sh`) listado em `adb devices`.
2. Build Android instalada com o pacote `com.ipebook.app` (`npm run android`, `npm run apk:debug` ou build de desenvolvimento).
3. Maestro instalado (`maestro --version`).

## Como executar

```bash
# Todos os fluxos
maestro test .maestro/

# Fluxo específico passando credenciais de teste por ambiente
maestro test -e E2E_EMAIL="leitor@exemplo.com" -e E2E_SENHA="..." .maestro/01-onboarding-e-catalogo.yaml
```
