# Tarefas de Implementação — Spec 061 (Mensagens e Chat da Negociação)

- [x] **Tarefa 1: Model e Interfaces**
  - Criar `src/model/entities/negotiationMessage.ts`.
  - Criar validador `src/model/validators/messageValidator.ts`.
  - Criar interface `src/model/datasources/iMessageDataSource.ts`.

- [x] **Tarefa 2: Casos de Uso com Regras de Negócio e Testes Unitários (TDD)**
  - Implementar `GetNegotiationMessagesUseCase` e `SendNegotiationMessageUseCase`.
  - Criar testes unitários em `tests/unit/negotiationMessageUseCases.test.ts`.

- [x] **Tarefa 3: Infraestrutura (Memory e Supabase) + Migração SQL com RLS**
  - Implementar `MemoryMessageDataSource`.
  - Implementar `SupabaseMessageDataSource`.
  - Criar migração SQL `supabase/migrations/202610240001_mensagens_negociacao.sql`.
  - Atualizar `scripts/verificar-migracoes.mjs` com testes de segurança RLS para mensagens.

- [x] **Tarefa 4: Injeção de Dependências (DI)**
  - Registrar serviços em `src/di/container.ts`.

- [x] **Tarefa 5: ViewModel**
  - Implementar `src/viewmodel/useNegotiationChatViewModel.ts`.
  - Escrever testes do ViewModel em `tests/hooks/useNegotiationChatViewModel.test.tsx`.

- [x] **Tarefa 6: View e Integração no Detalhe do Pedido**
  - Implementar componente de chat `src/view/requests/NegotiationChatModal.tsx`.
  - Integrar botão "Abrir conversa" em `src/view/requests/requestDetail.tsx`.
  - Testes visuais de componente em `tests/components/negotiationChatView.test.tsx`.

- [x] **Tarefa 7: ADR e Validação Final**
  - Criar `docs/adr/0044-chat-mensagens-negociacao.md` e atualizar `docs/adr/README.md`.
  - Executar `npm run validate` e `npm run verify:release`.
