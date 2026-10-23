# 0037 — Encontro como entidade própria da negociação

Data: 2026-10-22. Status: aceito.

## Contexto

A Spec 052 (Issue #188) permite que as duas pessoas de uma negociação aceita combinem local, dia e
horário do encontro, confirmem, reagendem e cancelem (Figma `06.04`, `06.05`, `06.11`–`06.14`). O
pedido (`v2_book_requests`) só conhece `pending | accepted | rejected`, tem gatilho que impede
mudanças depois do aceite e é alterado por uma RPC atômica (ADR 0030). Notificações no Supabase só
são criadas por gatilhos `security definer`; o cliente não insere em `v2_notifications`.

## Decisão

1. Criar a tabela `v2_meetings`, uma linha por convite, ligada a `v2_book_requests` por `request_id`,
   com `point_name`, `scheduled_at` (`timestamptz`), `proposed_by` e `status`
   (`proposed | confirmed | cancelled`).
2. Garantir no banco: índice único parcial de um encontro ativo por pedido; RLS restrita aos dois
   participantes de pedido `accepted`; gatilho que recusa data no passado, local fora da lista,
   troca de participantes, confirmação por quem propôs e transições inválidas.
3. Gerar as notificações de convite, confirmação, reagendamento e cancelamento por gatilho
   `security definer`, com o novo tipo `meeting_update`, como já é feito com alertas de busca. No
   modo em memória, `MemoryMeetingDataSource` reproduz o gatilho.
4. A lista de pontos permitidos fica em `PIRIPIRI_MEETING_POINTS` (código) e é repetida no gatilho
   SQL; mudar um exige mudar o outro.

## Alternativas consideradas

- **Colunas novas em `v2_book_requests`:** exigiria afrouxar o gatilho que congela o pedido depois do
  aceite e misturaria o ciclo do pedido com o do encontro; o histórico de convites cancelados se
  perderia.
- **Notificação criada pelo cliente:** exigiria liberar `insert` em `v2_notifications`, permitindo
  que qualquer pessoa notificasse outra com texto arbitrário.

## Consequências

- Reverter o código não remove a tabela; a reversão de dados é uma migração própria
  (`drop table public.v2_meetings`), sem afetar pedidos e livros.
- Convites cancelados ficam como histórico da negociação e entram na exportação LGPD futuramente.
- A lista de pontos fica duplicada entre TypeScript e SQL, coberta por teste que compara as duas.

Vínculos: [Spec 052](../../specs/052-combinar-encontro/spec.md), [Issue #188](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/188),
[ADR 0030](0030-aceite-atomico-e-politica-de-avaliacoes.md).
