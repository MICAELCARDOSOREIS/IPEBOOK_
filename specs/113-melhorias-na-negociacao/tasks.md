# Tarefas — Especificação 113 (Melhorias na Negociação)

Status geral: [ ] Em atualização

## Fase 1: Banco de Dados e Migração SQL
- [x] T1.1 Criar migração `supabase/migrations/202610310003_negociacao_melhorias.sql` com `initial_message` e `offered_book_id` em `v2_book_requests`.
- [x] T1.2 Atualizar scripts de validação (`scripts/verificar-migracoes.mjs`, `scripts/verificar-migracoes-remotas.mjs`) e rodar `npm run test:sql`.

## Fase 2: Domínio e Infraestrutura
- [x] T2.1 Atualizar tipos em `bookRequest.ts`, `iBookRequestDataSource.ts`, `memoryBookRequestDataSource.ts` e `supabaseBookRequestDataSource.ts`.
- [x] T2.2 Atualizar `bookRequestUseCases.ts` e testes unitários correspondentes.
- [x] T2.3 Implementar utilitário `src/view/calendarIntegration.ts` para agendamento em calendário.

## Fase 3: Timeline e Cartão de Status no Chat
- [x] T3.1 Estender `src/viewmodel/chatTimeline.ts` para suportar itens de evento (`kind: "event"`).
- [x] T3.2 Criar componente `src/view/conversations/NegotiationStatusCard.tsx` com ações rápidas de encontro e entrega.
- [x] T3.3 Atualizar `src/view/conversations/chat.tsx` integrando o card no topo e os eventos na timeline.

## Fase 4: Modal de Proposta e Avaliação Direta
- [x] T4.1 Criar modal `src/view/listings/ProposalSheet.tsx` para envio de mensagem e seleção de livro de troca.
- [x] T4.2 Integrar `ProposalSheet` em `src/view/listings/bookDetail.tsx`.
- [x] T4.3 Atualizar `src/view/requests/delivery.tsx` para abrir automaticamente `NegotiationRatingModal` após confirmação.

## Fase 5: Validação, Testes e Verificação Integral
- [x] T5.1 Rodar `npm run typecheck` e corrigir eventuais inconsistências.
- [x] T5.2 Rodar `npm run check:architecture` e `npm run check:numbering`.
- [x] T5.3 Rodar `npm run test:coverage` garantindo métricas globais ≥ 80%.
- [x] T5.4 Rodar `npm run validate` e consolidar commit na branch `feat/113-melhorias-na-negociacao`.

## Complemento: pedidos recebidos
- [x] T6.1 Mostrar a mensagem inicial e o livro oferecido quando disponíveis.
- [x] T6.2 Destacar a contagem de pendentes e dar prioridade visual a "Aceitar".
- [x] T6.3 Exibir pedidos entregues como "Finalizados" e separar seus contadores/filtro de "Aceitos".
- [x] T6.4 Executar `npm run check:architecture` e `git diff --check` após o complemento.
- [x] T6.5 Executar `npm run typecheck` após o ajuste visual; passou.
- [x] T6.6 Compactar o topo da tela recebida para mostrar os pedidos com menos rolagem.
- [ ] T6.7 Conferir a tela em celular, incluindo mensagem e troca sem dados opcionais (pendente: o ADB não iniciou neste ambiente por restrição de permissão).
- [x] T6.8 Abrir automaticamente em "Pendentes" quando houver propostas aguardando resposta e voltar para "Todos" quando a última for resolvida.
- [x] T6.9 Mostrar confirmação breve após aceitar ou recusar, sem deslocar a lista.
