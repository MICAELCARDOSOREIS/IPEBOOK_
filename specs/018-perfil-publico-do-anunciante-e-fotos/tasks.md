# Tarefas: Perfil Público do Anunciante e Fotos (Spec 018)

- [x] T001 Confirmar se existe algum registro de avaliação concluída na spec 009; se não,
  criar entidade `Rating` e contrato de datasource. Confirmado que não existe (`BookRequest`
  só tem status `pending`/`accepted`/`rejected`, sem avaliação); criada `src/model/entities/rating.ts`
  e `src/model/datasources/iRatingDataSource.ts`. Também foi preciso criar um perfil público
  mínimo (`src/model/entities/publicProfile.ts` e `iProfileDataSource.ts`), já que `User` não
  tinha nome nem data de entrada.
- [x] T002 Implementar datasources em memória e Supabase para avaliação (e para o perfil
  público): `memoryRatingDataSource.ts`, `supabaseRatingDataSource.ts`, `memoryProfileDataSource.ts`,
  `supabaseProfileDataSource.ts`.
- [x] T003 Registrar resolução no container de DI (`src/di/container.ts`).
- [x] T004 Implementar `publicProfileUseCases.getPublicProfile(userId)` agregando nome, média de
  avaliação, contagem de avaliações e negociações concluídas (contadas como pedidos com
  status `accepted`, como dono ou solicitante — ver limitação em `validacao.md`).
- [x] T005 Criar `usePublicProfileViewModel`.
- [x] T006 Criar View `PublicProfile` e `PhotoGallery`; link a partir do detalhe do livro
  (toque na capa abre a galeria quando há foto; nome de quem anuncia já navegava para o
  perfil, só foi redirecionado de `/usuario/[id]` para `/perfil/[userId]`).
- [x] T007 Criar rota `src/app/perfil/[userId].tsx` (galeria é um modal dentro do próprio
  `bookDetail.tsx`, sem rota própria — mais simples e sem necessidade de passar fotos pela URL).
- [x] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [x] T009 Executar `npm run validate` (equivalente: typecheck + check:architecture + test:sql +
  test:coverage) e `npm run build:web`, registrado em `validacao.md`.
