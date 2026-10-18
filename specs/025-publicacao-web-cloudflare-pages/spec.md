# Especificação: Publicação Web da Beta via Cloudflare Pages (Spec 025)

## 1. Contexto e Problema

O Ipebook é um aplicativo multiplataforma voltado à comunidade de Piripiri, PI. A versão Web gerada estaticamente pelo Expo Router é um canal essencial para acesso rápido sem necessidade de instalação de aplicativo em lojas móveis.
Anteriormente, o repositório continha um arquivo `vercel.json` obsoleto e não possuía configurações explícitas para a plataforma adotada (Cloudflare Pages), resultando em ausência de regras de rewrite para rotas dinâmicas com parâmetros (`/livro/[id]`, etc.) e cabeçalhos de segurança incompletos.

## 2. Regras e Configurações Técnicas

- **RT-01 (Limpeza de Artefatos Legados)**: Remoção de configurações de outras plataformas que causem ambiguidade arquitetural (`vercel.json`).
- **RT-02 (Suporte a Rotas Dinâmicas em SPA Estática)**: Configuração de rewrites transparentes (status HTTP `200`) em `public/_redirects` para as rotas parametrizadas do Expo Router:
  - `/livro/*` -> `/livro/[id].html`
  - `/editar-anuncio/*` -> `/editar-anuncio/[id].html`
  - `/denunciar/*` -> `/denunciar/[id].html`
  - `/negociacao/*` -> `/negociacao/[id].html`
  - Fallback global 404 direcionando URLs não encontradas para `+not-found.html`.
- **RT-03 (Segurança e Políticas de Cache em `_headers`)**:
  - Proteção contra sniffing (`X-Content-Type-Options: nosniff`), framing (`X-Frame-Options: DENY`) e CSP permitindo conexões com o Supabase e fontes do Google.
  - Cache imutável de 1 ano para assets do bundler (`_expo/static/*`).
  - Cache dinâmico sem stale (`max-age=0, must-revalidate`) para documentos HTML.
- **RT-04 (Automação de Export)**: A pasta `public/` é copiada automaticamente para `dist/` durante a execução de `npm run build:web`.
- **RT-05 (Documentação Operacional)**: `docs/implantacao-cloudflare.md` deve cobrir os parâmetros de build, variáveis de ambiente, configuração de autenticação no Supabase, smoke tests pós-deploy e procedimento de reversão.

## 3. Critérios de Aceite

1. `vercel.json` removido do repositório.
2. Arquivos `public/_headers` e `public/_redirects` criados com as diretivas especificadas.
3. Execução de `npm run build:web` gera `dist/_headers` e `dist/_redirects` intactos junto com as 22 rotas estáticas.
4. Documentação de implantação detalhada em `docs/implantacao-cloudflare.md`.
5. ADR 0020 aceito e referenciado em `docs/adr/README.md`.
6. Validação completa com `npm run validate` e `npm run build:web` aprovada com 0 erros.
