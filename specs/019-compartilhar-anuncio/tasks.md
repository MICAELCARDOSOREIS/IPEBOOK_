# Tarefas: Compartilhar Anúncio (Spec 019)

- [ ] T001 Confirmar que `src/app/livro/[id].tsx` já funciona como deep link direto (sem passar
  pela Home); ajustar roteamento se não funcionar.
- [ ] T002 Criar `shareUseCases.buildListingShareUrl(bookId)`.
- [ ] T003 Criar `useShareListingViewModel` com ramos Android (`Share.share`) e Web (clipboard).
- [ ] T004 Adicionar botão "Compartilhar" no detalhe do livro com feedback "Link copiado"
  (Snackbar) no caminho Web.
- [ ] T005 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [ ] T006 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
