# Fluxos E2E Nativos Android (Maestro)

Este diretório reúne os fluxos declarativos do **Maestro** (`appId: com.ipebook.app`) voltados aos recursos de hardware e integrações nativas do Android que não são exercitáveis na suíte E2E Web ([`tests/e2e/`](../tests/e2e/run.mjs)):

- `01-onboarding-e-catalogo.yaml`: catálogo autenticado (`Início`, modal de local, `Explorar`, busca, filtros, ordenação e `Favoritos`) e, quando `-e E2E_CLEAR_STATE=true`, onboarding limpo, login opcional (`E2E_EMAIL`/`E2E_SENHA`) e diálogo de notificações (`Avisos no seu celular`).
- `02-login-google-e-sessao.yaml`: fluxo nativo **Continuar com Google** quando sem sessão e validação de sessão/perfil autenticado (`Meu perfil` → `Editar perfil`) quando já logado.
- `03-anunciar-isbn-camera.yaml`: leitor nativo de código de barras **ISBN pela câmera** (`Escanear ISBN`), preenchimento da etapa 1, fluxo de foto/câmera na etapa 2 (`Fotos do seu livro`) e limpeza do rascunho.
- `04-entrega-qr-e-notificacoes.yaml`: acesso à central de `Notificações` (com verificação opcional de permissão), `Conversas`, negociação/agendamento de encontro e alternância câmera **QR Code** / código manual (`Entrega do livro`).
- `05-detalhe-estante-e-anuncios.yaml`: detalhe do livro, perfil público, tela de denúncia (sem enviar), `Estante`, rascunhos, propostas/`Pedidos recebidos`, gestão e abertura de `Editar anúncio` (sem salvar).
- `06-perfil-configuracoes-e-institucionais.yaml`: sub-telas de `Meu perfil`, `Configurações` (`Privacidade e dados`, `Pessoas bloqueadas`, `Ajuda`, `Termos e privacidade`, `Sobre` e moderação quando aplicável), `Meus alertas` e `+not-found` via deep link (`ipebook://`).

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
