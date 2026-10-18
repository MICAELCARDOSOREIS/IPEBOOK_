# 0020 — Publicação Web da Beta via Cloudflare Pages

## Status

Aceito

## Contexto

A versão beta do Ipebook inclui como canal primário de acesso a aplicação Web estática gerada via Expo Router (`output: "static"`).
No repositório raiz, havia um arquivo `vercel.json` herdado de protótipos anteriores que não refletia a estratégia de infraestrutura atual e gerava ruído e ambiguidades sobre o destino do deploy.

A Cloudflare Pages foi selecionada como a plataforma de hospedagem da versão Web por oferecer:
1. Distribuição global em rede de borda (CDN) com baixíssima latência para o Piauí e o Brasil;
2. Suporte nativo a arquivos de cabeçalhos (`_headers`) e redirecionamentos/rewrites (`_redirects`);
3. Rollbacks instantâneos de deployments atômicos no dashboard;
4. Custos nulos de saída de dados (egress) no plano gratuito, sustentável para a comunidade de Piripiri;
5. Integração direta com builds automatizados do repositório Git.

## Decisão

1. **Remoção de Legados:** Remover definitivamente `vercel.json` do repositório.
2. **Definição de Regras de Redirecionamento e Rotas Dinâmicas:**
   - Criar `public/_redirects` com rewrites HTTP 200 para rotas dinâmicas do Expo Router (`/denunciar/*`, `/editar-anuncio/*`, `/livro/*`, `/negociacao/*`) apontando para seus respectivos stubs `[id].html`.
   - Adicionar regra de fallback 404 para URLs não encontradas direcionando para `/+not-found.html`.
3. **Definição de Cabeçalhos de Segurança e Cache:**
   - Criar `public/_headers` com proteção estrita de cabeçalhos (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, CSP permitindo conexões com o Supabase e fontes Google).
   - Cache de 1 ano imutável (`Cache-Control: public, max-age=31536000, immutable`) para bundles estáticos versionados em `_expo/static/*`.
   - Revalidação imediata (`max-age=0, must-revalidate`) para documentos HTML.
4. **Exportação Automática:**
   - A pasta `public/` é copiada automaticamente para `dist/` durante a execução do comando oficial `npm run build:web` (`expo export --platform web`).
5. **Documentação Operacional:**
   - Criar `docs/implantacao-cloudflare.md` descrevendo os parâmetros de build, as variáveis de ambiente necessárias (`EXPO_PUBLIC_BACKEND`, `EXPO_PUBLIC_SUPABASE_URL`, etc.), a sincronização de URLs de redirecionamento no Supabase Auth, o checklist de smoke tests e o procedimento de reversão.

## Consequências

- **Positivas:**
  - Build estático reproduzível e pronto para ser integrado a pipelines de CI/CD ou conectado diretamente no painel da Cloudflare Pages.
  - Eliminação de erros 404 ao atualizar rotas dinâmicas pelo navegador (deep links e F5 em `/livro/[id]`).
  - Segurança aprimorada contra framing malicioso e injeção de scripts não autorizados.
  - Alinhamento de infraestrutura documentado e versionado.
- **Negativas / Limitações:**
  - Atualizações nas variáveis de ambiente exigem novo build no painel da Cloudflare.
  - As URLs permitidas de redirecionamento do Supabase Auth devem ser mantidas alinhadas ao domínio do Cloudflare Pages.
