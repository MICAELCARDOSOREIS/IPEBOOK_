# Especificação 119 — Pré-visualização Rica de Links no WhatsApp e Redes Sociais (Open Graph Cards)

**Status:** Concluída  
**Data:** 3 de novembro de 2026  
**Contexto:** UX / Viralidade / Web / Cloudflare Pages / WhatsApp / SEO  
**ADR vinculada:** [0093](../../docs/adr/0093-open-graph-cards-compartilhamento.md)

## 1. Problema e Motivação

Quando um leitor de Piripiri compartilha um livro no WhatsApp através do link `https://ipebook.app/livro/{id}` (Spec 118), o WhatsApp dispara um crawler para gerar a pré-visualização (card social com imagem, título e descrição).

Anteriormente:
- O HTML exportado pelo SPA continha apenas a descrição genérica do aplicativo.
- O WhatsApp não encontrava tags `og:image`, `og:title` nem `og:description` específicas do exemplar.
- Os cards ficavam em branco ou exibiam apenas o link bruto, reduzindo drasticamente o engajamento e a atratividade do anúncio nos grupos de WhatsApp e WhatsApp Status.

## 2. Escopo

1. **Cloudflare Pages Function (`functions/livro/[id].ts`):**
   - Interceptar requisições da rota `/livro/:id` no Edge.
   - Detectar crawlers sociais (WhatsApp, Facebook, Twitter, Telegram, Discord, Googlebot, etc.) ou fornecer metadados para requisições diretas.
   - Obter os dados do anúncio a partir da API pública do Supabase (`/rest/v1/v2_books`).
   - Gerar metadados enriquecidos:
     - `og:title`: `"{Título} · {Autor} | IpêBook Piripiri"` (ou `"Box: {Título} ({N} volumes)..."`).
     - `og:description`: modalidade (`"💰 Venda por R$ XX,XX"`, `"🔄 Disponível para Troca"`, `"🎁 Doação Gratuita"`), bairro em Piripiri e chamada comunitária.
     - `og:image`: URL da foto da capa do livro cadastrada (ou imagem fallback oficial do IpêBook).
     - `og:url`: `https://ipebook.app/livro/{id}`.
     - `og:type`: `"book"`.
     - `twitter:card`: `"summary_large_image"`.
   - Injetar no `<head>` do HTML estático antes do envio ao cliente.

2. **Injeção de Metadados Fallback no Build Web (`scripts/preparar-dist-web.mjs`):**
   - Inserir tags Open Graph padrão em `dist/index.html` e `dist/livro/[id].html` apontando para a marca IpêBook e imagem `/icone-512.png`.

3. **Módulo Client-Side Web (`src/view/webMeta.ts`):**
   - Função utilitária `updateSocialMetaTags({ title, description, image, url })` que atualiza as tags `meta` e `title` no navegador web durante a navegação interna.
   - Integração com `bookDetail.tsx` para sincronização ao carregar o livro.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | A função de borda formata corretamente título, descrição e imagem de livros regulares e boxes. | Testes unitários do formatador de Open Graph |
| CA2 | O script de preparação web injeta tags Open Graph de fallback nos arquivos HTML exportados. | Testes em `preparar-dist-web` e inspeção de build |
| CA3 | Ao carregar o detalhe do livro na web, os metadados do documento no navegador são atualizados. | Teste de unidade/componente |
| CA4 | Build web (`npm run build:web`), arquitetura (`check:architecture`) e tipos (`typecheck`) 100% aprovados. | Scripts de validação |
