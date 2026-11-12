# Tarefas — Spec 119: Pré-visualização Rica de Links no WhatsApp e Redes Sociais (Open Graph Cards)

- [x] T1: Criar gerador puro de Open Graph `src/model/formatters/openGraphFormatter.ts` e testes unitários em `tests/unit/openGraphFormatter.test.ts`.
- [x] T2: Criar Cloudflare Pages Function `functions/livro/[id].ts` com suporte a crawlers sociais e fallback de livro.
- [x] T3: Atualizar `scripts/preparar-dist-web.mjs` para injetar tags Open Graph padrão nos arquivos HTML do `dist/`.
- [x] T4: Criar módulo client-side `src/view/webMeta.ts` e integrá-lo em `src/view/listings/bookDetail.tsx`.
- [x] T5: Validar com testes unitários, `npm run build:web`, `npm run check:architecture` e `npm run check:numbering`.
