# Tarefas: Rascunhos de Anúncio (Spec 017)

- [ ] T001 Decidir e implementar o modelo de dado do rascunho (estender `Book["status"]` com
  `"draft"` ou criar entidade própria `DraftBook`) — registrar a decisão no `plan.md`.
- [ ] T002 Implementar/ajustar datasources em memória e Supabase para suportar rascunho.
- [ ] T003 Registrar resolução no container de DI, se necessário.
- [ ] T004 Implementar `saveDraft`, `resumeDraft`, `discardDraft`, `listDrafts` no usecase
  correspondente.
- [ ] T005 Criar `useDraftsViewModel`; ajustar `useCreateListingViewModel` para salvar/retomar
  por etapa.
- [ ] T006 Criar View `Drafts`/`DraftsScreen`; adicionar ação "Salvar para depois" no fluxo de
  anunciar existente.
- [ ] T007 Criar rota `src/app/rascunhos.tsx`; atalho em "Meus anúncios" e no fluxo de anunciar.
- [ ] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [ ] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
