# Especificação 100 — Avisos de mensagem, pedido recusado e avaliação

Status: implementada e testada localmente; migração `202610280007_avisos_restantes.sql` aplicada no Supabase remoto. ADR: [0076](../../docs/adr/0076-avisos-de-mensagem-recusa-e-avaliacao.md).

## Objetivo
Completar os avisos do app: até aqui, mensagem nova no chat, pedido recusado e avaliação recebida não geravam nada em `v2_notifications`, então nem a central nem o push (Spec 096) avisavam.

## Escopo
- Novos tipos `new_message`, `request_rejected` e `rating_received` (restrição `v2_notifications_type_check`, entidade, Edge Function `enviar-push`, ícones da central e preferências).
- Gatilhos `v2_message_notifies` (`v2_negotiation_messages`) e `v2_rating_notifies` (`v2_ratings`); `v2_notify_request_change()` passa a tratar a recusa.
- Fora do escopo: novas telas, resumo diário e avisos por e-mail.

## Regras de negócio
- **RN-01** Mensagem nova avisa a outra pessoa da negociação (`/negociacao/[id]`), nunca quem enviou.
- **RN-02** Enquanto houver aviso de mensagem não lido da mesma negociação, novas mensagens não criam outro aviso.
- **RN-03** Pedido recusado (inclusive a recusa automática quando outro pedido do livro é aceito) avisa quem pediu (`/meus-pedidos`).
- **RN-04** Avaliação recebida avisa quem foi avaliado (`/perfil/avaliacoes`).
- **RN-05** Mensagem e recusa usam o canal `messages` (alta prioridade); avaliação usa `updates`. Em Configurações, mensagem e recusa ficam em "Propostas e mensagens"; avaliação em "Avisos do sistema".

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | RN-01 e RN-02 | Cenário SQL (`verificar-migracoes.mjs`, Spec 100) |
| CA2 | RN-03 | Cenário SQL |
| CA3 | RN-04 e terceiros não veem avisos alheios | Cenário SQL |
| CA4 | Canais e prioridade iguais no app e no servidor | `tests/unit/enviarPushLogic.test.ts` |
| CA5 | Preferências gravam os novos tipos | `tests/hooks/useNotificationPreferencesViewModel.test.tsx` |
| CA6 | Reconciliação remota reconhece a migração | `tests/unit/supabaseRemoteHealth.test.ts` |
