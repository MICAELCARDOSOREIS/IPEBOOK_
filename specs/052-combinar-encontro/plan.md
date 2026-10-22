# Plano de implementação — Spec 052

Decisão arquitetural registrada no [ADR 0036](../../docs/adr/0036-encontro-como-entidade-propria.md):
o encontro é uma entidade própria (`v2_meetings`), e não colunas novas em `v2_book_requests`.

## Modelo (`src/model`)

- `entities/meeting.ts`: `MeetingStatus = "proposed" | "confirmed" | "cancelled"`;
  `Meeting = Readonly<{ id, requestId, pointName, scheduledAt (ISO), proposedBy, status }>`;
  `MEETING_TIME_SLOTS = [9, 10, 15, 17]`; `MEETING_MAX_DAYS_AHEAD = 7`.
- `validators/meetingValidator.ts`: `validateMeetingProposal({ pointName, scheduledAt }, now)` →
  RN-02 e RN-03, com `now` injetável.
- `datasources/iMeetingDataSource.ts`: `findActiveByRequest`, `create`, `update(id, patch, expectedStatus)`.

## Casos de uso (`src/usecase`)

- `meetingUseCases.ts` (`IMeetingUseCases`): `getMeeting(requestId, userId)`,
  `propose(requestId, input, userId)`, `confirm(meetingId, userId)`,
  `reschedule(meetingId, input, userId)`, `cancel(meetingId, userId)`.
  Reaproveita `IBookRequestDataSource` e `IBookDataSource` para RN-01 e
  `INotificationDataSource` para RN-08. Relógio injetável para os testes.

## Infraestrutura (`src/infra`)

- `datasources/memoryMeetingDataSource.ts` e `supabaseMeetingDataSource.ts`.
- Migração `supabase/migrations/202610220001_encontros.sql`:
  - tabela `v2_meetings` (`request_id` → `v2_book_requests`, `point_name`, `scheduled_at`,
    `proposed_by`, `status`, `created_at`, `updated_at`);
  - `check` de situação e índice único parcial (`request_id`) onde `status <> 'cancelled'` (RN-04);
  - gatilho que recusa `scheduled_at` no passado e confirmação por quem propôs (RN-03, RN-05);
  - RLS: participantes de pedido `accepted` leem, inserem e atualizam (RN-01).
  - Reversão: `drop table public.v2_meetings` em migração própria, se necessário; sem dados de
    terceiros afetados.

## Composição (`src/di/container.ts`)

Instanciar memória ou Supabase conforme `EXPO_PUBLIC_BACKEND`, como os demais.

## ViewModel (`src/viewmodel`)

- `useMeetingViewModel(requestId, userId)`: estado do encontro, opções de dia/horário a partir de
  `now`, ações `propose`, `confirm`, `reschedule`, `cancel`, com `useFormErrorAnnouncer` e
  `formRateLimit` (3 por minuto) como nos demais formulários.

## View e rotas

- `src/view/requests/scheduleMeeting.tsx` (`06.04` e `06.13`, mesmo formulário com título e ação
  diferentes) e rota `src/app/negociacao/[id]/encontro.tsx`.
- `src/view/requests/requestDetail.tsx`: cartão do encontro (sem encontro → "Combinar encontro";
  `proposed` → aguardando ou confirmar; `confirmed` → resumo de `06.05` com "Reagendar" e
  "Cancelar encontro"; `cancelled` → aviso e "Combinar novo encontro"). Diálogo de cancelamento
  (`06.11`) com `Dialog`.
- `public/_redirects`: incluir a nova rota dinâmica.

## Verificação

`npm run validate`; teste SQL com três usuários; build Web e conferência via CDP com dois usuários
em memória contra os nós do Figma listados na spec.
