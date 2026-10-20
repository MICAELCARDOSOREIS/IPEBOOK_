# Tarefas: Compartilhar Anúncio (Spec 019)

- [x] T001 Confirmar que `src/app/livro/[id].tsx` já funciona como deep link direto (sem passar
  pela Home); ajustar roteamento se não funcionar. Confirmado: a rota é um arquivo estático do
  Expo Router sem guarda de autenticação (`InitialRouteGate` só decide a rota inicial em `/`);
  nenhum ajuste de roteamento foi necessário.
- [x] T002 Criar `shareUseCases.buildListingShareUrl(bookId)`. Implementado como
  `ShareUseCases.buildListingSharePath(bookId)` em `src/usecase/shareUseCases.ts` — retorna o
  caminho relativo (`/livro/{id}`); a resolução da URL completa por plataforma fica no
  ViewModel (ver T003), respeitando o isolamento de camadas (usecase não pode importar
  dependências externas).
- [x] T003 Criar `useShareListingViewModel` com ramos Android (`Share.share`) e Web (clipboard).
  `src/viewmodel/useShareListingViewModel.ts`, usando `expo-linking` (`Linking.createURL`) para
  montar a URL completa a partir do caminho do usecase.
- [x] T004 Adicionar botão "Compartilhar" no detalhe do livro com feedback "Link copiado"
  (Snackbar) no caminho Web. `src/view/listings/bookDetail.tsx`.
- [x] T005 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
  `tests/unit/shareUseCases.test.ts`, `tests/hooks/useShareListingViewModel.test.tsx`,
  testes adicionados em `tests/components-mocked/bookDetailView.test.tsx`.
- [x] T006 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
