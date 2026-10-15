# Tarefas: Perfil Público do Anunciante e Fotos (Spec 018)

- [ ] T001 Confirmar se existe algum registro de avaliação concluída na spec 009; se não,
  criar entidade `Rating` e contrato de datasource.
- [ ] T002 Implementar datasources em memória e Supabase para avaliação (se T001 confirmar a
  necessidade).
- [ ] T003 Registrar resolução no container de DI.
- [ ] T004 Implementar `ratingUseCases.getPublicProfile(userId)` agregando nome, média de
  avaliação e negociações concluídas.
- [ ] T005 Criar `usePublicProfileViewModel`.
- [ ] T006 Criar View `PublicProfile`/`PublicProfileScreen` e `PhotoGallery`; adicionar link a
  partir do detalhe do livro.
- [ ] T007 Criar rota `src/app/perfil/[userId].tsx` e a visualização de galeria de fotos.
- [ ] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [ ] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
