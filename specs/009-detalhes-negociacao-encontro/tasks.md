# Tarefas: Detalhes da Negociação e Encontro (Spec 009)

- [x] T001 Estender `IBookRequestUseCases` com `NegotiationDetail` e `getRequestDetail(requestId, sessionUserId)`.
- [x] T002 Implementar `getRequestDetail` em `BookRequestUseCases` com proteção de privacidade, e testes unitários em `tests/unit/requestDetailUseCases.test.ts`.
- [x] T003 Criar a ViewModel `src/viewmodel/useRequestDetailViewModel.ts` com testes em `tests/hooks/useRequestDetailViewModel.test.tsx`.
- [x] T004 Criar a tela `src/view/requests/requestDetail.tsx` e `RequestDetailScreen`, com testes em `tests/components/requestDetailView.test.tsx`.
- [x] T005 Criar a rota dinâmica `src/app/negociacao/[id].tsx`.
- [x] T006 Adicionar atalho "Ver detalhes do encontro" em `receivedRequests.tsx`, `sentRequests.tsx` e suas rotas.
- [x] T007 Criar teste de integração completo em `tests/integration/requestDetailIntegration.test.tsx`.
- [x] T008 Rodar validação completa (`npm run validate` e `npm run build:web`) e registrar em `validacao.md`.
