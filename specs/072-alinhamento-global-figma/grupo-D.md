# Relatório de Alinhamento — Grupo D: Estante e Negociações

**Status:** Concluído com sucesso (44/44 testes aprovados)  
**Telas cobertas:** 05.01–05.08, 06.01–06.22  
**Data:** 25/10/2026

## Telas Verificadas e Alinhadas
1. **05.01 · Estante (`src/view/listings/myListings.tsx`)**:
   - Abas Material 3: "Anúncios (N)", "Propostas (N)" e "Concluídos" com indicadores ativos conforme Figma `25:392`.
   - Filtros de status de anúncio: Todos, Disponíveis, Reservados, Pausados.
   - FAB "Anunciar livro" posicionado com elevação e tokens M3.
2. **05.02 · Estante Vazia (`src/view/listings/myListingsEmpty.tsx`)**:
   - Ilustração e mensagem de boas-vindas à estante comunitária.
   - Botão de ação primária "Anunciar livro" com alvo de toque de 48dp.
3. **06.01 / 06.03 · Pedidos (`src/view/requests/sentRequests.tsx` e `receivedRequests.tsx`)**:
   - Layout padronizado via `RequestListLayout`.
   - Modais e cards de status de negociação e pontos de encontro em Piripiri.
4. **06.02, 06.04–06.06 · Detalhe do Encontro e Chat (`src/view/requests/requestDetail.tsx`, `NegotiationChatModal.tsx`)**:
   - Cards de encontro com pontos seguros (Praça da Bandeira, etc.) e abertura de mapas.
   - Diálogo de mensagens contextuais do encontro.
5. **06.21, 06.22 · Avaliação da Negociação (`src/view/requests/NegotiationRatingModal.tsx`)**:
   - 5 estrelas M3 interativas, comentários opcionais e feedback de envio.

## Testes Automatizados Validados
- `tests/components/myListingsView.test.tsx` (16/16 passaram)
- `tests/components/requestDetailView.test.tsx` (7/7 passaram)
- `tests/components/requestListViews.test.tsx` (7/7 passaram)
- `tests/components/negotiationRatingView.test.tsx` (4/4 passaram)
- `tests/components/meetingViews.test.tsx` (10/10 passaram)

