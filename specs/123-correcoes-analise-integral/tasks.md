# Tarefas: correções da análise integral

- [x] T001 Ajustar `functions/livro/[id].ts` para `modality`/`neighborhood` com `OPEN_GRAPH_BOOK_COLUMNS` exportado.
- [x] T002 Atualizar `tests/unit/cloudflareFunction.test.ts` com colunas reais, conferência do `select` e comparação com `BOOK_COLUMNS` (falha antes, passa depois).
- [x] T003 Tornar `useGuardedPress` incondicional em `settings.tsx`, `receivedRequests.tsx`, `sentRequests.tsx`, `reportListing.tsx` e `reportUser.tsx`.
- [x] T004 Remover o rebaixamento de `useHookAtTopLevel` em `biome.json`.
- [x] T005 Aplicar correções automáticas do Biome e conferir `npm run validate` e `npm run build:web`.
- [x] T006 Atualizar `docs/estado.md`, `docs/qualidade.md` e `README.md`.
- [x] T007 Publicar no Cloudflare Pages e conferir o card com `curl -A WhatsApp https://ipebook.app/livro/{id}` (conferido em 2026-11-05 em `https://ipebook.app/livro/969d59be-6718-40f1-bd25-b5be18103369`, retornando `og:title="Dom Casmurro · Machado de Assis | IpêBook Piripiri"` e `og:description="🎁 Doação gratuita no bairro Centro, Piripiri - PI..."`).
