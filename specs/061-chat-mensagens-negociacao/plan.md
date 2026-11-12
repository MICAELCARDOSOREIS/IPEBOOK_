# Plano de Implementação — Spec 061 (Mensagens e Chat da Negociação)

## Arquitetura de 7 Camadas

1. **Camada 1 (Model / Entidades e Interfaces):**
   - Criar `src/model/entities/negotiationMessage.ts`.
   - Criar `src/model/datasources/iMessageDataSource.ts`.
   - Criar `src/model/validators/messageValidator.ts`.

2. **Camada 2 (Model / Casos de Uso):**
   - Criar `src/model/usecases/messageUseCases.ts`:
     - `GetNegotiationMessagesUseCase`: valida se o solicitante é participante do pedido aceito e retorna lista ordenada.
     - `SendNegotiationMessageUseCase`: valida autorização, sanitiza conteúdo, verifica bloqueio mútuo e persiste a mensagem.

3. **Camada 3 (Infraestrutura):**
   - Criar `src/infra/datasources/memoryMessageDataSource.ts`: persistência reativa em memória para testes e fallback offline.
   - Criar `src/infra/datasources/supabaseMessageDataSource.ts`: persistência na tabela Supabase `negotiation_messages`.
   - Criar migração SQL `supabase/migrations/20261024000000_v2_negotiation_messages.sql`:
     - Tabela `negotiation_messages` com FK para `book_requests` e `profiles`.
     - RLS `SELECT` e `INSERT` que conferem se `auth.uid()` é participante do pedido e não está bloqueado.
     - Adicionar testes de RLS em `scripts/verificar-migracoes.mjs`.

4. **Camada 4 (Injeção de Dependências):**
   - Atualizar `src/di/container.ts` com `messageDataSource`, `getNegotiationMessagesUseCase`, `sendNegotiationMessageUseCase`.

5. **Camada 5 (ViewModel):**
   - Criar `src/viewmodel/useNegotiationChatViewModel.ts`:
     - Gerenciamento de estado (`messages`, `inputText`, `isSending`, `error`, `isLoading`).
     - Ações `sendMessage`, `setInputText`, `refresh`.

6. **Camada 6 (View / Componentes):**
   - Criar `src/view/requests/NegotiationChatModal.tsx` ou tela de chat:
     - Balões de conversa estilo Figma `06.02` e `06.16`.
     - Indicador de falha/reenvio `06.10`.
     - Tratamento de tema claro/escuro via `useTheme()`.
   - Adicionar botão de ação "Conversar" / "Abrir conversa" em `src/view/requests/requestDetail.tsx`.

7. **Camada 7 (Rotas / App):**
   - Rota ou modal integrado no fluxo de negociação `/pedidos/[id]`.

## Validação e Testes

- Testes unitários para regras de negócio e validação: `tests/unit/negotiationMessageUseCases.test.ts`.
- Testes de componentes visuais do chat: `tests/components/negotiationChatView.test.tsx`.
- Validação SQL e RLS: `npm run test:sql`.
- Validação geral de integridade: `npm run validate`.
