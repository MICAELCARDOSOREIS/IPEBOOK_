# Spec 086 — Conversas e notificações em tempo real

## Problema
O chat já assinava `postgres_changes` de `v2_negotiation_messages`, mas nenhuma tabela estava na
publicação `supabase_realtime` do projeto; o Supabase nunca emitia os eventos. A lista de conversas e
a central de notificações só atualizavam ao reabrir a tela.

## Escopo
- Migração `202610260003_tempo_real_conversas_notificacoes.sql`: publica `v2_negotiation_messages`,
  `v2_notifications` e `v2_book_requests` (idempotente). A RLS existente filtra o que cada pessoa recebe.
- Notificações: `useNotificationsViewModel` assina mudanças da própria pessoa e recarrega sem piscar.
- Conversas: `useConversationsViewModel` recarrega ao chegar mensagem nova ou notificação (pedido novo,
  aceito ou recusado); a tela mantém a lista visível durante a recarga.

Fora do escopo: push com o app fechado, indicador de "digitando", contador de não lidas por conversa.

## Critérios de aceite
- CA1: mensagem enviada por outra pessoa aparece no chat aberto sem recarregar.
  Teste: `npm run test:sql` (publicação) + validação manual em dois aparelhos.
- CA2: notificação nova aparece na central e no contador sem recarregar.
  Teste: `tests/hooks/useNotificationsViewModel.test.tsx` (recarga silenciosa e cancelamento).
- CA3: lista de conversas atualiza com mensagem ou pedido novo.
  Teste: `tests/hooks/useConversationsViewModel.test.tsx`.
- CA4: assinaturas são canceladas ao sair da tela (sem vazamento de canais). Mesmos testes.

## Validação
Testes automatizados acima. A validação em aparelho depende de aplicar a migração no Supabase remoto.
