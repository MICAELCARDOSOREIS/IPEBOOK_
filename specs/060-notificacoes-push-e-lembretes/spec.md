# Spec 060 — Notificações Push Locais e Lembretes de Encontros Presenciais

## Contexto e Objetivo

No Ipebook, as negociações de livros culminam em encontros presenciais em pontos seguros credenciados de Piripiri (Figma `06.11`–`06.14`, Spec 052). Além disso, usuários recebem propostas de troca, venda ou doação (`request_received`) e atualizações de alertas de busca (`search_alert_match`).

Esta especificação implementa a infraestrutura de notificações no dispositivo via `expo-notifications`:
1. Gerenciamento seguro de permissões de notificação do sistema operacional.
2. Agendamento de notificações locais para lembretes de encontros presenciais (ex.: 1 hora antes do horário combinado).
3. Configuração de canais de notificação no Android com alta prioridade para encontros.
4. Coleta opcional de token Expo Push para futuras integrações remotas com Supabase Webhooks.
5. Tolerância total a plataformas (Web/PWA e simuladores sem APNs/FCM) e modo memória para testes automatizados.

## Requisitos Funcionais

- **RF-01**: A aplicação deve expor o serviço `IPushNotificationService` com métodos para checar e solicitar permissões de notificação.
- **RF-02**: O sistema deve permitir o agendamento de notificações locais com título, mensagem, dados e gatilho em segundos ou timestamp específico.
- **RF-03**: O sistema deve permitir o agendamento de lembrete de encontro com cálculo de antecedência (lembrete prévio antes do horário do encontro).
- **RF-04**: O sistema deve permitir cancelar notificações locais previamente agendadas (por exemplo, ao cancelar ou reagendar um encontro presencial).
- **RF-05**: No Android, deve ser configurado o canal de notificações padrão com som e vibração habilitados.
- **RF-06**: Caso o usuário negue a permissão ou a plataforma seja a Web sem suporte, o serviço deve degradar graciosamente sem lançar exceções não tratadas.

## Critérios de Aceite

- **CA-01**: Interface `IPushNotificationService` criada em `src/model/services/iPushNotificationService.ts`.
- **CA-02**: Implementações `ExpoPushNotificationService` e `MemoryPushNotificationService` criadas em `src/infra/services/`.
- **CA-03**: Registro e injeção do serviço no container de DI (`src/di/container.ts`).
- **CA-04**: Testes unitários com 100% de cobertura para os serviços de notificação.
- **CA-05**: Conformidade estrita com a barreira de 7 camadas e zero regressões na suíte de testes.
