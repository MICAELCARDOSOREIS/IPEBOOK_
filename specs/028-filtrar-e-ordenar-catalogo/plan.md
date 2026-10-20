# Plano de Implementação — Spec 028: Filtrar e Ordenar o Catálogo

## 1. Estratégia de Implementação

1. **Aprimoramento do ViewModel (`src/viewmodel/useSearchViewModel.ts`)**:
   - Adicionar os estados de `category`, `priceRange`, `sortBy` estendido (`recent`, `title`, `price_asc`, `price_desc`).
   - Computar `hasActiveFilters` e `availableCategories`.
   - Adicionar ações `setCategory`, `setPriceRange`, `setSortBy`, `clearFilters`.
   - Implementar a função pura de filtragem e ordenação cobrindo todas as combinações.

2. **Criação de Testes Unitários do ViewModel (`tests/unit/useSearchViewModel.test.ts`)**:
   - Testar filtro por modalidade.
   - Testar filtro por categoria (existente e inexistente).
   - Testar filtro por faixa de preço e doações.
   - Testar ordenação por mais recentes, título, menor preço e maior preço.
   - Testar ação `clearFilters`.

3. **Atualização da Interface de Busca (`src/view/search/search.tsx`)**:
   - Incluir chips de filtro para categorias, modalidade, preço e ordenação.
   - Incluir botão "Limpar filtros" quando `state.hasActiveFilters` for verdadeiro.
   - Exibir estado vazio com opção de limpeza rápida de filtros.

4. **Atualização dos Testes de Componente (`tests/components-mocked/searchView.test.tsx`)**:
   - Cobrir a renderização dos novos chips.
   - Simular cliques em filtros de categoria e preço.
   - Validar interação com "Limpar filtros".

5. **Validação Final**:
   - Rodar `npm run typecheck`, `npm run check:architecture`, `npm test` e `npm run validate`.
