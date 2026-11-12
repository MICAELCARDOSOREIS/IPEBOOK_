# Tarefas: Preferências privadas do perfil (Spec 034 / Issue #141)

- [x] T001 Migração `v2_user_preferences` (telefone, bairro) com RLS restrita ao dono
      (`supabase/migrations/202610210001_preferencias_privadas_perfil.sql`).
- [x] T002 `IUserPreferencesDataSource` (model) + `MemoryUserPreferencesDataSource` e
      `SupabaseUserPreferencesDataSource` (infra), com testes.
- [x] T003 `UserPreferences`/`UserPreferencesEdits` (model) e `IUserPreferencesUseCases`/
      `UserPreferencesUseCases` (usecase) — valida telefone (10-11 dígitos) e bairro (deve estar
      em `PIRIPIRI_NEIGHBORHOODS`), com teste unitário.
- [x] T004 Wiring em `src/di/container.ts` (`userPreferencesUseCases`).
- [x] T005 `useUserPreferencesViewModel.ts` (novo), com teste.
- [x] T006 `src/view/profile/profile.tsx`: campo "Telefone/WhatsApp" (`TextField`) e seletor de
      "Bairro padrão" (`Chip`, reaproveitando `PIRIPIRI_NEIGHBORHOODS` de
      `src/model/entities/location.ts`); "Salvar" grava perfil público e preferências privadas
      juntos; testes de componente cobrindo preenchimento, salvar e erro de validação.

## Continuação (26/10/2026) — ADR 0061

- [x] T007 `src/view/profile/profile.tsx`: bairro inicial `null` (sem "Centro" inventado), rótulo
      "Bairros de Piripiri", estados de carregamento/sem sessão no lugar de `null`, diálogo de
      descarte ao voltar (barra superior e `BackHandler`), "Remover foto", contador do nome e
      resumo do bloqueio de salvamento em região viva.
- [x] T008 `src/view/profile/profileHub.tsx`: cartão de identidade usa o bairro real de
      `useUserPreferencesViewModel`, com fallback "Piripiri, PI".
- [x] T009 Testes: `tests/components-mocked/profileView.test.tsx` (7 casos novos) e
      `tests/components/profileHubView.test.tsx` (bairro real e ausência de bairro); o mock
      compartilhado de `react-native` ganhou `BackHandler`.
