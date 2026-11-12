# 0077 — Cancelar pedido por status e avisos de favoritos no servidor

- Data: 2026-10-28
- Status: aceito
- Especificação: [101](../../specs/101-cancelar-pedido-e-avisos-de-favoritos/spec.md)

## Contexto
Quem pedia um livro não tinha como desistir, e quem favoritava não sabia quando o livro baixava de preço ou saía do ar.

## Decisão
- Cancelar é uma transição `pending → cancelled` feita por quem pediu, sob política RLS própria; o gatilho de pedidos (ADR 0074/0076) avisa quem anunciou.
- Gatilhos em `v2_books` avisam os favoritos em queda de preço, indisponibilidade e exclusão (antes da cascata apagar os favoritos), com o tipo único `favorite_update`.

## Alternativas consideradas
- Apagar o pedido em vez de mudar o status: perderia o chat e o histórico.
- Avisar também alta de preço e volta à disponibilidade: mais ruído do que valor por ora.

## Consequências
- Telas que tratam "recusado" como histórico passam a tratar "cancelado" igual.
- Mudanças em massa de anúncios geram um aviso por favorito.
