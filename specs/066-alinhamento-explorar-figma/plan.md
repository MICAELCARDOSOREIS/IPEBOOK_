# Plano de Implementação — Spec 066 (Alinhamento do Explorar ao Figma 02.02)

## Arquitetura em Camadas

- **Camada 4 / Componentes Reutilizáveis:**
  - Atualizar `src/view/components/SearchField.tsx` para incluir o ícone de lupa Material 3 (`AppIcon name="search"`).
- **Camada 6 / View (Apresentação):**
  - Atualizar `src/view/search/search.tsx`:
    - Adicionar propriedades `currentNeighborhood` e `onSelectNeighborhood` em `SearchProps`.
    - Renderizar a barra superior com `neighborhoodPill` e `topRightActions` (`tuneButton`, `clearFiltersButton`).
    - Atualizar a manchete editorial com `fontFamily.brand` para o título.
    - Transformar as categorias rápidas em carrossel horizontal (`quickCategoriesScroll`).
    - Transformar as linhas de resultado em cartões confinados (`card`) com cantos de 16px, título em serifa e coluna de ações (`FavoriteButton` + `chevronRight`).
  - Atualizar rota `src/app/pesquisa.tsx` para passar o bairro padrão se disponível.
- **Camada 7 / Testes e Verificação:**
  - Garantir passagem de `tests/components/searchField.test.tsx`.
  - Garantir passagem de `tests/components-mocked/searchView.test.tsx` e `tests/integration/sc006PesquisaIntegration.test.tsx`.
  - Executar `bun run check:numbering`, `bun run check:architecture` e `bun run typecheck`.

