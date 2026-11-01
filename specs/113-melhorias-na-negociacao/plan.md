# Plano de Implementação — Especificação 113 (Melhorias na Negociação)

## Arquitetura e Decisões
- **Modelagem de Dados e Banco (Migração SQL):**
  - Adicionar colunas `initial_message text` e `offered_book_id uuid references public.v2_books(id)` na tabela `public.v2_book_requests`.
  - Criar migração `supabase/migrations/202610310003_negociacao_melhorias.sql`.
  - Atualizar testes no PGlite em `scripts/verificar-migracoes.mjs` e `scripts/verificar-migracoes-remotas.mjs`.
- **Domínio:**
  - Estender tipos e entidades em `src/model/entities/bookRequest.ts` e contratos em `src/model/datasources/iBookRequestDataSource.ts`.
  - Atualizar `bookRequestUseCases.ts` para receber e propagar mensagem inicial e livro oferecido.
- **ViewModels:**
  - `useNegotiationChatViewModel`: carregar eventos de encontro e entrega para injetar na timeline do chat (`chatTimeline.ts`).
  - `useDeliveryViewModel`: disparar callback ou expor estado que acione o modal de avaliação após a confirmação.
  - `useBookDetailViewModel`: suportar abertura do modal de proposta e envio dos dados adicionais.
- **Componentes e Telas:**
  - `ProposalSheet.tsx`: componente modal acessível para confirmação da proposta com mensagem e lista de livros para troca.
  - `NegotiationStatusCard.tsx`: card integrado no topo do chat (`chat.tsx`).
  - `chatTimeline.ts`: adicionar tipo `event` na timeline com renderização semântica centralizada.
  - `delivery.tsx`: integração com `NegotiationRatingModal`.
  - `calendarIntegration.ts`: utilitário para gerar link do Google Calendar e calendário local para pontos de encontro de Piripiri.

## Fases de Execução
1. **Fase 1: Banco e Migração SQL** (colunas em `v2_book_requests`, integridade e testes PGlite).
2. **Fase 2: Domínio e Casos de Uso** (entidades, datasources e use cases).
3. **Fase 3: Timeline e Cartão de Status no Chat** (status card no topo, eventos na timeline).
4. **Fase 4: Modal de Proposta e Avaliação Direta** (ProposalSheet e fluxo da entrega).
5. **Fase 5: Validação, Testes e Verificação Completa** (`npm run validate`, cobertura ≥ 80%).
