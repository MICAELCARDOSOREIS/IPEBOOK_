# Tarefas: Estados Globais de Carregamento e Erro (Spec 021)

- [ ] T001 Levantar quais telas existentes não tratam loading/erro/sem conexão hoje; listar
  aqui antes de seguir (atualizar este arquivo com a lista real).
- [ ] T002 Conferir se `DataSourceError` (`src/model/errors.ts`) distingue "sem conexão" de
  outros erros; criar subtipo se não distinguir.
- [ ] T003 Criar componentes `LoadingState`, `OfflineState` e `ErrorState` em
  `src/view/components/`, com documentação correspondente em `design-system/04-componentes/`.
- [ ] T004 Criar hook utilitário `useAsyncState` (loading/error padronizado) para os ViewModels.
- [ ] T005 Aplicar os três estados nas telas levantadas em T001.
- [ ] T006 Implementar testes unitários e de componentes (cobertura > 80%).
- [ ] T007 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
