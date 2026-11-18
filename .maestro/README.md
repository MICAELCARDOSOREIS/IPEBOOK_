# Fluxos E2E Nativos Android (Maestro)

Este diretório reúne os fluxos declarativos do **Maestro** (`appId: com.ipebook.app`) voltados aos recursos de hardware e integrações nativas do Android que não são exercitáveis na suíte E2E Web ([`tests/e2e/`](../tests/e2e/run.mjs)):

- `01-onboarding-e-catalogo.yaml`: catálogo autenticado (`Início` / `Explorar` + filtros) e, quando `-e E2E_CLEAR_STATE=true`, onboarding limpo, login opcional (`E2E_EMAIL`/`E2E_SENHA`) e diálogo de notificações (`Avisos no seu celular`).
- `02-login-google-e-sessao.yaml`: fluxo nativo **Continuar com Google** quando sem sessão e validação de sessão/perfil autenticado quando já logado.
- `03-anunciar-isbn-camera.yaml`: leitor nativo de código de barras **ISBN pela câmera** (`Escanear ISBN`), preenchimento da etapa 1, fluxo de foto/câmera na etapa 2 (`Fotos do seu livro`) e limpeza do rascunho.
- `04-entrega-qr-e-notificacoes.yaml`: acesso à central de `Notificações` (com verificação opcional de permissão), abertura de `Conversas` e alternância câmera **QR Code** / código manual quando há conversa com encontro confirmado (`Entrega do livro`).

## Pré-requisitos para execução

1. Aparelho Android físico com Depuração USB ativa (ou Waydroid via `scripts/conectar-waydroid.sh`) listado em `adb devices`.
2. Build Android instalada com o pacote `com.ipebook.app` (`npm run android`, `npm run apk:debug` ou development build conectada ao Metro via `scripts/conectar-android.sh`).
3. Maestro instalado (`maestro --version`).

## Como executar

```bash
# Todos os fluxos preservando a sessão autenticada atual
maestro test .maestro/

# Incluindo reset de estado / onboarding completo em APK limpo ou dev-client com URL do Metro
maestro test -e E2E_CLEAR_STATE=true -e E2E_EMAIL="leitor@exemplo.com" -e E2E_SENHA="..." .maestro/01-onboarding-e-catalogo.yaml
```
