# Plano de Implementação — Spec 060 (Notificações Push e Lembretes)

## 1. Arquitetura e Camadas Afetadas

- **Model (`src/model/services/iPushNotificationService.ts`)**:
  - Contrato `IPushNotificationService` com métodos para checagem de permissão, agendamento de notificação local e cancelamento.
- **Infra (`src/infra/services/`)**:
  - `expoPushNotificationService.ts`: Implementação real utilizando `expo-notifications`.
  - `memoryPushNotificationService.ts`: Implementação em memória para testes e fallback web/offline.
- **DI (`src/di/container.ts`)**:
  - Injeção condicional de `pushNotificationService`.
- **Testes**:
  - `tests/unit/pushNotificationService.test.ts` cobrindo cenários com permissão concedida, negada, agendamento de lembrete com antecedência e cancelamento.

## 2. Validação

- `npm run check:numbering`
- `npm run check:architecture`
- `npm run typecheck`
- `npm run test`
