# Tarefas de Implementação — Spec 066 (Alinhamento do Explorar ao Figma 02.02)

- [x] **Tarefa 1: Decisão Arquitetural e Documentação**
  - Criar `docs/adr/0049-alinhamento-explorar-figma.md`.
  - Atualizar índice em `docs/adr/README.md`.

- [x] **Tarefa 2: Atualização do Campo de Busca (SearchField)**
  - Adicionar leading icon `search` no `src/view/components/SearchField.tsx`.
  - Validar com `tests/components/searchField.test.tsx`.

- [x] **Tarefa 3: Alinhamento Visual da View de Busca (Search)**
  - Atualizar `src/view/search/search.tsx` com topo, pílula de bairro, hero editorial serifado e cards confinados.
  - Atualizar rota `src/app/pesquisa.tsx`.

- [x] **Tarefa 4: Verificação de Testes e Qualidade**
  - Executar testes de `Search` em `tests/components-mocked/searchView.test.tsx` e `tests/integration/sc006PesquisaIntegration.test.tsx`.
  - Executar `bun run check:numbering`, `bun run check:architecture` e `bun run typecheck`.

