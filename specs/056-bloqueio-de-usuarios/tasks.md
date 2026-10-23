# Tarefas — Spec 056 (Bloqueio de Usuários)

- [x] **T001**: Criar ADR 0039 (`docs/adr/0039-bloqueio-de-usuarios-e-moderacao.md`) e atualizar índice de ADRs.
- [x] **T002**: Criar migração SQL `supabase/migrations/202610230002_bloqueio_usuarios.sql` com RLS e testar no PGlite (`verificar-migracoes.mjs`).
- [x] **T003**: Criar contratos e entidades no Model (`blockedUser.ts`, `iBlockedUserDataSource.ts`).
- [x] **T004**: Implementar datasources na camada Infra (`memoryBlockedUserDataSource.ts` e `supabaseBlockedUserDataSource.ts`).
- [x] **T005**: Implementar casos de uso (`iBlockedUserUseCases.ts`, `blockedUserUseCases.ts`) e testes unitários.
- [x] **T006**: Configurar DI no container (`di/container.ts`).
- [x] **T007**: Implementar ViewModel (`useBlockedUsersViewModel.ts`) e testes de hook.
- [x] **T008**: Implementar a View (`blockedUsers.tsx`) e integrar ao `profileHub.tsx`.
- [x] **T009**: Criar rota `src/app/perfil/bloqueados.tsx` e testes de componente.
- [x] **T010**: Executar validação agregada (`npm run validate`) e registrar documentação de validação.
