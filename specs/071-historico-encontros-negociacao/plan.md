# Plano de Implementação — Spec 071

## 1. Arquitetura e Modelagem

- Estender `IMeetingDataSource` com:
  - `listByRequest(requestId: string): Promise<readonly Meeting[]>`
  - `listByUser(userId: string): Promise<readonly Meeting[]>`
- Implementar métodos em:
  - `MemoryMeetingDataSource`
  - `SupabaseMeetingDataSource`
- Estender `IMeetingUseCases` e `MeetingUseCases` com:
  - `getMeetingHistory(requestId: string, sessionUserId: string | null): Promise<readonly Meeting[]>`
  - `getUserMeetingHistory(sessionUserId: string | null): Promise<readonly Meeting[]>`
- Atualizar `useMeetingViewModel` para incluir `history: readonly Meeting[]`.
- Atualizar `MeetingCard` para renderizar a seção de histórico quando houver encontros anteriores.
- Criar `src/viewmodel/useUserMeetingsViewModel.ts` para carregar o histórico de encontros do usuário.
- Criar `src/view/profile/meetingHistory.tsx` e rota `src/app/perfil/encontros.tsx`.
- Conectar navegação em `ProfileHub` e `src/app/perfil.tsx`.

## 2. Testes (TDD)

- Testes unitários para `MemoryMeetingDataSource` (`listByRequest` e `listByUser`).
- Testes para `meetingUseCases` (`getMeetingHistory` e `getUserMeetingHistory`).
- Testes de componentes para `MeetingCard` com histórico de encontros.
- Testes de componentes para `MeetingHistoryView`.
- Execução de testes de regressão e checagens estáticas.
