# Tarefas: Negociação Simples

As tarefas T003–T014 dependem de `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md`
(T001–T017) implementadas. O modelo T001/T002 pôde ser antecipado.

Responsável: **Antonio Carlos Gomes** (domínio de Negociação, ver
[docs/DIVISAO_FEATURES.md do projeto irmão](/home/usermicael/Projetos/IpeBook/docs/DIVISAO_FEATURES.md)),
todas as tarefas abaixo.

- [x] T001 Criar `src/model/entities/bookRequest.ts` e acrescentar `status` a
      `src/model/entities/book.ts`.
- [x] T002 Criar `src/model/datasources/iBookRequestDataSource.ts`.
- [ ] T003 Criar `src/usecase/bookRequestUseCases.ts` com `requestNegotiation` (FR-001 a
      FR-003), testes unitários cobrindo cada bloqueio.
- [ ] T004 Implementar `listReceivedRequests`/`listSentRequests`/`respondToRequest` em
      `bookRequestUseCases.ts` (FR-004, FR-005), com testes cobrindo recusa automática dos
      concorrentes.
- [ ] T005 Criar `src/infra/datasources/memoryBookRequestDataSource.ts` com testes.
- [ ] T006 Atualizar `src/di/container.ts` para compor `IBookRequestUseCases`.
- [ ] T007 Criar `src/viewmodel/useRequestNegotiationViewModel.ts` com testes.
- [ ] T008 Criar `src/viewmodel/useReceivedRequestsViewModel.ts` e
      `useSentRequestsViewModel.ts` com testes.
- [ ] T009 Acrescentar botão "Solicitar negociação" em `src/view/home.tsx` com testes RNTL.
- [ ] T010 Criar `src/view/requests/receivedRequests.tsx` e `sentRequests.tsx` com testes RNTL.
- [ ] T011 Criar rotas `src/app/pedidos-recebidos.tsx` e `src/app/meus-pedidos.tsx`.
- [ ] T012 Criar teste de integração cobrindo SC-002 (aceitar recusa os concorrentes e
      reserva o anúncio).
- [ ] T013 Atualizar `docs/arquitetura.md`, `docs/produto.md` e `docs/estado.md`.
- [ ] T014 Executar `npm run validate` e registrar evidências em
      `specs/004-negociacao-simples/validacao.md`.
