# Tarefas — Spec 052 (Combinar encontro)

Responsável: **Micael Cardoso Reis** (`pessoa:micael`). Issue #188.

- [x] T001 ADR 0037 (encontro como entidade própria) e índice de ADRs.
- [x] T002 `entities/meeting.ts` e `validators/meetingValidator.ts` com testes (RN-02, RN-03).
- [x] T003 `iMeetingDataSource.ts` e `memoryMeetingDataSource.ts` com testes (aviso à outra pessoa em `meetingNotice.ts`).
- [x] T004 `meetingUseCases.ts` com testes de RN-01, RN-04 a RN-08.
- [x] T005 Migração `202610220001_encontros.sql` com RLS e gatilhos; casos no `npm run test:sql`; diagnóstico remoto (`scripts/verificar-migracoes-remotas.mjs`) passa a conferir `v2_meetings`.
- [x] T006 `supabaseMeetingDataSource.ts` com testes do adaptador.
- [x] T007 Composição em `src/di/container.ts`.
- [x] T008 `useMeetingViewModel` com testes.
- [x] T009 Tela `scheduleMeeting.tsx` (`06.04`/`06.13`), rota `src/app/negociacao/[id]/encontro.tsx` e `_redirects`, com testes.
- [x] T010 Cartão do encontro e diálogo de cancelamento em `requestDetail.tsx` (`06.05`, `06.11`,
      `06.12`, `06.14`), com testes.
- [x] T011 `npm run validate`, conferência visual via CDP e `docs/estado.md` atualizado.
- [ ] T012 Aplicar a migração no Supabase remoto (exige autorização e credencial).
      Em 2026-10-22, pelo conector do Supabase, foram aplicadas as pendentes de outras specs:
      `202610200007`, `202610200008` (função `accept_book_request` e políticas novas),
      `202610210001` e `202610210002` (sem o `drop constraint if exists`, que não tinha alvo).
      Faltam, por exigirem confirmação de comando destrutivo: remover as políticas antigas
      `"usuário só cria avaliação em seu próprio nome"` e `"Dono responde pedido desta versão"`
      (até lá, convivem com as novas e mantêm o comportamento anterior) e aplicar
      `202610220001_encontros.sql` (recria `v2_notifications_type_check`). Depois, alinhar as
      versões em `supabase_migrations.schema_migrations`, gravadas como `20261022…`.
