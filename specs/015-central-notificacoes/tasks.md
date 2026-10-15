# Tarefas: Central de Notificações (Spec 015)

- [x] T001 Criar entidade `AppNotification` em `src/model/entities/notification.ts` e contrato `INotificationDataSource` em `src/model/datasources/iNotificationDataSource.ts`.
- [x] T002 Implementar `MemoryNotificationDataSource` em `src/infra/datasources/memoryNotificationDataSource.ts` e `SupabaseNotificationDataSource` em `src/infra/datasources/supabaseNotificationDataSource.ts`.
- [x] T003 Registrar resolução no container de DI `src/di/container.ts`.
- [x] T004 Criar caso de uso `INotificationUseCases` e `NotificationUseCases` em `src/usecase/notificationUseCases.ts`.
- [x] T005 Criar ViewModel `src/viewmodel/useNotificationsViewModel.ts`.
- [x] T006 Criar componentes View `Notifications` e `NotificationsScreen` em `src/view/notifications/notifications.tsx` e `notificationsScreen.tsx`.
- [x] T007 Criar rota `src/app/notificacoes.tsx` e integrar atalho na tela inicial `src/view/home.tsx` e rota `src/app/index.tsx`.
- [x] T008 Implementar testes unitários, de hooks e de componentes.
- [x] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
