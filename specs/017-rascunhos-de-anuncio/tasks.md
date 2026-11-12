# Tarefas: Rascunhos de Anúncio (Spec 017)

- [x] T001 Decidir e implementar o modelo de dado do rascunho (estender `Book["status"]` com
  `"draft"` ou criar entidade própria `DraftBook`) — registrar a decisão no `plan.md`.
- [x] T002 Implementar/ajustar datasources em memória e Supabase para suportar rascunho.
- [x] T003 Registrar resolução no container de DI, se necessário.
- [x] T004 Implementar `saveDraft`, `resumeDraft`, `discardDraft`, `listDrafts` no usecase
  correspondente.
- [x] T005 Criar `useDraftsViewModel`; ajustar `useCreateListingViewModel` para salvar/retomar
  por etapa.
- [x] T006 Criar View `Drafts`/`DraftsScreen`; adicionar ação "Salvar para depois" no fluxo de
  anunciar existente.
- [x] T007 Criar rota `src/app/rascunhos.tsx`; atalho em "Meus anúncios" e no fluxo de anunciar.
- [x] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [x] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
