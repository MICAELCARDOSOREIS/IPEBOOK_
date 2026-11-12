# 0070 — Concluir a negociação por QR code

Data: 2026-10-28. Status: aceito. Especificação: [095](../../specs/095-conclusao-por-qr-code/spec.md).

## Contexto
"Concluída" significava só ter registrado uma avaliação, e o botão "Já fizemos a entrega" permitia concluir sem encontro. Pediu-se que o anunciante mostre um QR code ao leitor para concluir.

## Decisão
- Duas tabelas novas: `v2_deliveries` (uma linha por pedido concluído, legível pelas duas pessoas) e `v2_delivery_codes` (código, validade e tentativas, sem nenhuma política: só as funções a acessam). Os pedidos aceitos não são alterados, pois o gatilho `guard_v2_book_request_update` proíbe qualquer mudança neles.
- Duas funções `SECURITY DEFINER`: `create_delivery_code(pedido)` (anunciante, encontro confirmado) e `complete_delivery(pedido, código)` (leitor). Elas validam papel, encontro, validade, uso único e limite de tentativas, e avisam a outra pessoa. `complete_delivery` devolve `ok`, `incorreto`, `expirado` ou `bloqueado` em vez de lançar exceção, para a contagem de tentativas não ser desfeita pelo rollback.
- O código tem 8 caracteres de um alfabeto sem ambiguidade; o QR leva `ipebook:entrega:<pedido>:<código>`.
- QR gerado com `qrcode-generator` (sem dependências, funciona na web e no app); leitura com `expo-camera`, já instalada.

- O livro vira `delivered` por um gatilho em `v2_deliveries` (migração `202610280002`), e não dentro de `complete_delivery`, para não redefinir a função já aplicada.

## Alternativas consideradas
- Novo status `completed` em `v2_book_requests`: bloqueado pelo gatilho de guarda.
- Botão simples "Concluir" sem QR: não prova o encontro.
- `react-native-qrcode-svg`: exige `react-native-svg`, mais pesado.

## Consequências
- Nova migração a aplicar no Supabase (com autorização).
- Dependência nova pequena (`qrcode-generator`).
- A leitura por câmera precisa de permissão; há o código digitável como alternativa.
