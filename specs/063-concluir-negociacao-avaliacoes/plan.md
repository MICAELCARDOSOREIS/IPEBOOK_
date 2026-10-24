# Plano de Implementação — Spec 063 (Conclusão e Avaliação da Negociação)

## Arquitetura em 7 Camadas

- **Camada 1 (Model / Entidades e Contratos):**
  - Estender `IRatingDataSource` com `findByRequestAndRater(requestId: string, raterId: string): Promise<Rating | null>`.
  - Criar validador `src/model/validators/ratingValidator.ts` para nota 1 a 5 e raterId !== ratedUserId.
- **Camada 2 (Use Cases):**
  - Atualizar `IRatingUseCases` e `RatingUseCases` com:
    - `submitRating(sessionUserId: string | null, params: SubmitRatingParams): Promise<Rating>`
    - `getNegotiationRating(sessionUserId: string | null, requestId: string): Promise<Rating | null>`
- **Camada 3 (Infra / DataSources):**
  - Implementar `findByRequestAndRater` em `MemoryRatingDataSource` e `SupabaseRatingDataSource`.
- **Camada 4 (DI Container):**
  - Garantir injeção de dependências em `src/di/container.ts` (já exporta `ratingUseCases`).
- **Camada 5 (ViewModel):**
  - Criar `src/viewmodel/useNegotiationRatingViewModel.ts` para orquestrar o estado de avaliação da negociação (loading, nota selecionada, envio e confirmação).
- **Camada 6 (View / Apresentação):**
  - Criar `src/view/requests/NegotiationRatingModal.tsx` com as 5 estrelas selecionáveis.
  - Integrar card de avaliação / status concluído em `src/view/requests/requestDetail.tsx`.
- **Camada 7 (Testes e Verificação):**
  - Testes unitários para use cases e validadores.
  - Testes de hook para o ViewModel.
  - Testes de componente para o Modal e a View.
  - Validação via `npm run validate` e verificação no celular via ADB.
