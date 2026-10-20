# Tarefas: Histórico de Buscas Recentes (Spec 027)

- [x] T001 Criar `ISearchHistoryDataSource` e as implementações `AsyncStorage` (real) e memória
  (testes), com limite de 10 termos e deduplicação (termo repetido sobe ao topo).
- [x] T002 Registrar `searchHistory` no container de DI (`src/di/container.ts`).
- [x] T003 Criar `searchHistoryUseCases` (`listTerms`, `registerSearch`, `clearHistory`),
  isolando a chave por `userId ?? "guest"`.
- [x] T004 Atualizar `useSearchViewModel` para expor `history`, `registerSearch` e
  `clearHistory`, recebendo `userId`.
- [x] T005 Atualizar `useDeleteAccountViewModel.deleteAccount` para limpar o histórico da conta
  ao concluir a exclusão com sucesso.
- [x] T006 Atualizar `search.tsx`: sugestões de histórico quando o campo está vazio, toque refaz
  a busca, botão "Limpar histórico" com `Dialog` de confirmação.
- [x] T007 Implementar testes unitários, de datasource, de hook e de componente (cobertura >
  80%).
- [x] T008 Executar `npm run validate`, registrar em `validacao.md`.
