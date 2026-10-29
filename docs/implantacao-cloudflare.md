# Roteiro de Implantação Web — Cloudflare Pages

Este documento estabelece o procedimento operacional de build, configuração, publicação e reversão do Ipebook Web no **Cloudflare Pages**, alinhado ao ADR 0020.

---

## 1. Arquitetura da Entrega Web

O Ipebook Web é compilado como uma aplicação web estática com hidratação client-side via **Expo Router** (`output: "static"` no `app.json`).

- **Comando de build:** `npm run build:web` (que executa `expo export --platform web`).
- **Diretório de saída:** `dist/`.
- **Roteamento SPA e rotas dinâmicas:** Regras em `public/_redirects` (copiadas automaticamente para `dist/_redirects`) direcionam rotas com parâmetros como `/livro/*`, `/editar-anuncio/*`, `/denunciar/*`, `/negociacao/*`, `/alertas/:id` e `/alertas/:id/editar` para os respectivos stubs `[id].html` com código HTTP `200` (rewrite), permitindo que o Expo Router no navegador extraia os parâmetros e monte a tela. A rota de edição de alerta vem antes da rota de gerenciamento para preservar a correspondência mais específica.
- **Cabeçalhos de Segurança:** Configurados em `public/_headers` (copiados para `dist/_headers`), cobrindo CSP, proteção contra clickjacking (`X-Frame-Options: DENY`), sniffing de MIME (`X-Content-Type-Options: nosniff`) e cache imutável de longo prazo para bundles em `_expo/static/*`.

---

## 2. Configuração no Painel do Cloudflare Pages

### 2.1 Conexão do Repositório Git
1. No dashboard da Cloudflare, acesse **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecione o repositório `IPEBOOK_` (ou a organização correspondente).
3. Selecione o branch de produção/homologação desejado (ex.: `develop` para homologação ou `main` para release estável).

### 2.2 Parâmetros de Build
Defina os campos exatos de compilação:
- **Project name:** `ipebook` (ou `ipebook-beta`)
- **Framework preset:** `None`
- **Build command:** `npm run build:web`
- **Build output directory:** `dist`
- **Root directory:** `/`

### 2.3 Variáveis de Ambiente (Environment Variables)
Em **Settings** > **Environment variables**, configure as seguintes chaves para os ambientes de **Production** e **Preview**:

| Variável | Valor Recomendado / Descrição |
|---|---|
| `NODE_VERSION` | `20.18.0` (ou `>= 20.0.0`) |
| `EXPO_PUBLIC_BACKEND` | `supabase` |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xiuuiggpccpgrwkzeloc.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | *(Chave anônima pública `sbp_...` do projeto Supabase)* |
| `EXPO_PUBLIC_AUTH_REDIRECT_URL` | `https://ipebook.pages.dev/entrar` (ou o domínio customizado) |

---

## 3. Configuração no Supabase Auth

Para que o fluxo de autenticação por e-mail/magic link e redefinição de senha funcione no domínio da Cloudflare:
1. Acesse o painel do Supabase do projeto `xiuuiggpccpgrwkzeloc`.
2. Vá em **Authentication** > **URL Configuration**.
3. Em **Site URL**, configure a URL principal (ex.: `https://ipebook.pages.dev`).
4. Em **Redirect URLs**, adicione:
   - `https://ipebook.pages.dev/**`
   - `https://*.ipebook.pages.dev/**` (para suportar branches de preview da Cloudflare)

---

## 4. Checklist de Verificação Pós-Deploy (Smoke Tests)

Após a conclusão da implantação pela Cloudflare:
1. **Página Inicial:** Acessar a URL base e conferir o carregamento da vitrine de livros de Piripiri, PI.
2. **Rotas Estáticas:** Navegar para `/pesquisa`, `/termos`, `/ajuda` e `/entrar`, conferindo ausência de erros no console do navegador.
3. **Rotas Dinâmicas (F5 direto):** Acessar diretamente uma URL de anúncio (ex.: `/livro/fbb7e0a4-378d-4e9e-a61f-13589c381c8c`) e atualizar a página. O navegador deve exibir os detalhes do livro sem retornar erro 404 da CDN.
4. **Tratamento de 404:** Acessar `/rota-inexistente-12345` e conferir a apresentação da tela de recurso não encontrado (`+not-found.html`) com status 404.
5. **Autenticação:** Testar login ou cadastro com credenciais válidas e verificar persistência de sessão e permissões RLS.
6. **Cabeçalhos HTTP:** Inspecionar resposta com `curl -I https://ipebook.pages.dev` e validar presença dos cabeçalhos `X-Content-Type-Options`, `X-Frame-Options` e `Content-Security-Policy`.

---

## 5. Procedimento de Rollback / Reversão

Se qualquer problema for detectado no deployment ativo:
1. No dashboard da Cloudflare, acesse **Workers & Pages** > projeto `ipebook` > **Deployments**.
2. Localize o deployment estável anterior na lista de histórico.
3. Clique nas reticências (`...`) do deployment anterior e selecione **Rollback to this deployment**.
4. A Cloudflare Pages redireciona o tráfego instantaneamente para o bundle anterior sem necessidade de recompilação.
