# ADR 0063 — Adoção do domínio próprio ipebook.app e redirecionamento canônico no Cloudflare Pages

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** ADR 0020 (Publicação Web via Cloudflare Pages), ADR 0040 (Compartilhar e convidar amigos), ADR 0059 (Identidade Android e build EAS `com.ipebook.app`), Spec 025 (Publicação Web Cloudflare Pages), Spec 057 (Convidar amigos).
- **Relacionado a:** ADR 0008 (escopo da beta), ADR 0035 (PWA service worker e cache offline) e ADR 0062 (chat realtime e push token).

## Contexto

Desde a publicação inicial da aplicação Web (ADR 0020 e Issue #109), o IpêBook esteve hospedado no subdomínio padrão fornecido pela Cloudflare: `https://ipebook.pages.dev`.

Embora funcional para homologação e smoke tests, o subdomínio técnico `.pages.dev` apresentava limitações:
1. **Identidade de marca e confiança:** A comunidade de leitores de Piripiri e novos usuários recebiam links de compartilhamento apontando para um subdomínio de infraestrutura, reduzindo a percepção de oficialidade do projeto comunitário.
2. **Alinhamento com o ecossistema móvel:** O ADR 0059 já havia fixado a identidade de pacote Android como `com.ipebook.app`. A ausência do domínio canônico correspondente gerava dissonância entre os identificadores do aplicativo e a presença na Web.
3. **Indexação e SEO:** A permanência no subdomínio da plataforma de hospedagem dividia a autoridade de busca e complicava a transição futura de links compartilhados no WhatsApp e redes sociais.

## Decisão

1. **Domínio Canônico:** Adotar formalmente **`https://ipebook.app`** como o domínio canônico e oficial de produção do IpêBook na Web.
2. **Redirecionamento Canônico 301 no Cloudflare Pages:** Adicionar no topo de `public/_redirects` a regra de rewrite com prioridade de execução (`!`):
   ```text
   https://ipebook.pages.dev/* https://ipebook.app/:splat 301!
   ```
   Isso garante que qualquer acesso direto ou link legado apontando para `ipebook.pages.dev` seja redirecionado permanentemente com código HTTP 301 para a rota correspondente em `ipebook.app`.
3. **Compartilhamento e Convites:** Atualizar a URL padrão injetada em `ShareUseCases.buildInviteMessage()` e `useInviteFriendsViewModel` de `https://ipebook.pages.dev` para `https://ipebook.app`. Os links gerados para o WhatsApp e para a área de transferência agora carregam a marca oficial.
4. **Resiliência CSP no Cloudflare:** Atualizar a diretiva `connect-src` de `public/_headers` para incluir explicitamente `wss://xiuuiggpccpgrwkzeloc.supabase.co wss://*.supabase.co`, garantindo que conexões WebSockets para chat em tempo real funcionem sem bloqueio em qualquer domínio de origem.
5. **Procedimento Operacional no Painel Cloudflare e Supabase:** Documentar no `docs/implantacao-cloudflare.md` a vinculação de Custom Domain (`ipebook.app` e `www.ipebook.app`), a emissão de certificados SSL/TLS Universal pela Cloudflare e o registro das Redirect URLs no Supabase Auth (`https://ipebook.app/**`).

## Consequências

- **Positivas:**
  - Identidade limpa, profissional e memorável para a comunidade de Piripiri (`ipebook.app`).
  - Total coerência com o package ID do aplicativo Android (`com.ipebook.app`).
  - Redirecionamento transparente sem quebra de links antigos ou favoritos salvos no subdomínio `.pages.dev`.
  - PWA pode ser instalado a partir do domínio próprio com manifesto e escopo consistentes.
- **Negativas / Atenção Operacional:**
  - O painel do Supabase Auth precisa conter `https://ipebook.app/**` na lista de URLs permitidas de redirecionamento, caso contrário logins OAuth e links mágicos falharão.
  - A propagação DNS inicial de novos registros de domínio pode levar alguns minutos dependendo dos servidores recursivos locais.

## Alternativas consideradas

- **Manter `ipebook.pages.dev` permanentemente:** Descartado para evitar acúmulo de tráfego em subdomínio de terceiros e falta de autoridade de marca.
- **Utilizar domínio `.com.br` ou `.com`:** Considerado, mas o TLD `.app` é reconhecido internacionalmente para aplicações modernas, possui HSTS (HTTPS obrigatório) forçado por padrão na raiz pelo Google Registry, aumentando a segurança de ponta a ponta.
