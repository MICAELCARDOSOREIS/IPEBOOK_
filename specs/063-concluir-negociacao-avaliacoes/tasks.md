# Tarefas de Implementação — Spec 063 (Conclusão e Avaliação da Negociação)

- [x] **Tarefa 1: Documentar Decisão Arquitetural (ADR 0046)**
  - Criar `docs/adr/0046-concluir-negociacao-avaliacoes.md`.
  - Atualizar índice em `docs/adr/README.md`.

- [x] **Tarefa 2: Camada 1 & 3 — Contrato e DataSources de Avaliação**
  - Adicionar `findByRequestAndRater` em `IRatingDataSource`.
  - Implementar em `MemoryRatingDataSource` e `SupabaseRatingDataSource`.
  - Criar validador em `src/model/validators/ratingValidator.ts`.

- [x] **Tarefa 3: Camada 2 — Casos de Uso de Avaliação**
  - Implementar `submitRating` e `getNegotiationRating` em `RatingUseCases`.
  - Adicionar testes unitários em `tests/unit/ratingUseCases.test.ts`.

- [x] **Tarefa 4: Camada 5 — ViewModel de Avaliação**
  - Criar `src/viewmodel/useNegotiationRatingViewModel.ts`.
  - Adicionar testes de hook em `tests/hooks/useNegotiationRatingViewModel.test.tsx`.

- [x] **Tarefa 5: Camada 6 — View e Modal de Avaliação**
  - Criar `src/view/requests/NegotiationRatingModal.tsx` com 5 estrelas selecionáveis, acessibilidade semântica (`accessibilityRole="radio"`) e área de toque mínima de 48dp.
  - Integrar botão "Concluir e avaliar" e estado de conclusão com nota em `src/view/requests/requestDetail.tsx`.
  - Adicionar testes de componente em `tests/components/negotiationRatingView.test.tsx`.

- [x] **Tarefa 6: Validação Completa de Qualidade**
  - Executar `npm run check:numbering` e `npm run check:architecture`.
  - Executar `npm run validate`.

- [x] **Tarefa 7: Validação Visual no Samsung Galaxy A16 via ADB**
  - Capturar screenshot no aparelho real e confirmar funcionamento.
