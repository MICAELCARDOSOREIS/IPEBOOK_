# Plano de Implementação: Central de Notificações (Spec 015)

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - `src/model/entities/notification.ts`: Interface `AppNotification` com `id`, `userId`, `title`, `message`, `type` (`"request_received" | "request_accepted" | "safety_tip" | "system"`), `read`, `createdAt`, `actionUrl`.
   - `src/model/datasources/iNotificationDataSource.ts`: Interface do contrato de persistência.
2. **Infra:**
   - `src/infra/datasources/memoryNotificationDataSource.ts`: Implementação em memória com dados mock representativos para a comunidade de Piripiri.
   - `src/infra/datasources/supabaseNotificationDataSource.ts`: Implementação conectável ao Supabase.
3. **DI:**
   - `src/di/container.ts`: Registro de `resolveNotificationDataSource` e `resolveNotificationUseCases`.
4. **UseCase:**
   - `src/usecase/iNotificationUseCases.ts` e `src/usecase/notificationUseCases.ts`: Regras de negócio de listagem e leitura de notificações com validação de sessão.
5. **ViewModel:**
   - `src/viewmodel/useNotificationsViewModel.ts`: Estado reativo (loading, notifications, filter, unreadCount, error) e ações (`markAsRead`, `markAllAsRead`, `setFilter`, `refresh`).
6. **View:**
   - `src/view/notifications/notifications.tsx`: Interface visual de notificações com TopAppBar, abas de filtro, estado vazio e cartões clicáveis com badges de não lida.
   - `src/view/notifications/notificationsScreen.tsx`: Tela conectada ao ViewModel e container DI.
7. **App (Expo Router):**
   - `src/app/notificacoes.tsx`: Rota da central de notificações.
   - Atualização em `src/view/home.tsx` com atalho de Notificações para usuários autenticados.
8. **Testes e Validação:**
   - Testes unitários do UseCase e DataSource.
   - Testes de hook do ViewModel.
   - Testes de componentes da View.
   - Validação com `npm run validate` e `npm run build:web`.
