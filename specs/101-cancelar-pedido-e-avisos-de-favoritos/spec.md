# Especificação 101 — Cancelar pedido e avisos de livros favoritados

Status: implementada e testada localmente; migração `202610280008_cancelar_pedido_e_avisos_de_favoritos.sql` aguardando aplicação no Supabase remoto. ADR: [0077](../../docs/adr/0077-cancelar-pedido-e-avisos-de-favoritos.md).

## Objetivo
Permitir que quem pediu um livro desista do pedido ainda sem resposta, avisando quem anunciou, e avisar quem favoritou um livro quando o preço baixa ou o livro deixa de estar disponível.

## Escopo
- Status `cancelled` em `v2_book_requests`, política RLS própria e botão "Cancelar pedido" em Conversas (pedidos enviados pendentes), com confirmação.
- Tipos de aviso `request_cancelled` (canal `messages`) e `favorite_update` (canal `updates`).
- Gatilhos `v2_book_notifies_favorites` (preço/status) e `v2_book_delete_notifies_favorites` (exclusão).
- Fora do escopo: aviso de "voltou a ficar disponível" e alta de preço.

## Regras de negócio
- **RN-01** Só quem pediu cancela, e só pedido `pending`. Quem anunciou continua podendo apenas recusar.
- **RN-02** Cancelar avisa quem anunciou (`/pedidos-recebidos`). Depois de cancelar, a pessoa pode pedir de novo.
- **RN-03** Pedido cancelado sai de Conversas e aparece no histórico das listas de pedidos.
- **RN-04** Queda de preço de livro disponível avisa quem favoritou (`/livro/[id]`); alta não avisa.
- **RN-05** Livro disponível que passa a reservado, pausado ou entregue avisa quem favoritou (`/livro/[id]`).
- **RN-06** Livro disponível excluído (moderação ou exclusão de conta) avisa quem favoritou (`/favoritos`).
- **RN-07** Quem anunciou nunca recebe aviso de favorito do próprio livro.
- **RN-08** Em Configurações, cancelamento fica em "Propostas e mensagens"; favoritos em "Alertas de busca e favoritos".

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | RN-01 e RN-02 no banco (dono e terceiro não cancelam; aviso criado) | Cenário SQL (`verificar-migracoes.mjs`, Spec 101) |
| CA2 | RN-01 e RN-02 na regra de negócio | `tests/unit/bookRequestUseCases.test.ts` |
| CA3 | RN-03 e botão com confirmação e erro | `tests/hooks/useConversationsViewModel.test.tsx`, `tests/components-mocked/conversationsView.test.tsx` |
| CA4 | RN-04 a RN-07 | Cenário SQL |
| CA5 | Canais iguais no app e servidor; preferências | `tests/unit/enviarPushLogic.test.ts`, `tests/hooks/useNotificationPreferencesViewModel.test.tsx` |
