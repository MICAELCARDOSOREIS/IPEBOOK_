# Especificação 121 — Ordenação Avançada no Catálogo e Pesquisa (Bairros de Piripiri, Preço e Recência)

**Status:** Concluída  
**Data:** 3 de novembro de 2026  
**Contexto:** UX / Pesquisa / Catálogo / Proximidade Hiperlocal / Mobile / Web  
**ADR vinculada:** [0095](../../docs/adr/0095-ordenacao-avancada-catalogo.md)

## 1. Problema e Motivação

Na exploração e busca de livros do IpêBook, os leitores de Piripiri precisam encontrar livros com facilidade, considerando tanto o valor financeiro (ou gratuidade/troca) quanto a proximidade geográfica comunitária.

Anteriormente:
1. As opções de ordenação cobriam apenas recência (`recent`), título alfabético (`title`), menor preço (`price_asc`) e maior preço (`price_desc`).
2. Não havia uma opção para priorizar os livros do próprio bairro do leitor ou para agrupar livros por bairros de Piripiri sem excluir os demais bairros do resultado da busca.
3. No layout Web Desktop, o painel lateral de filtros (`WebFilterSidebar`) não exibia as opções de ordenação, exigindo que o leitor usasse a linha de resumo superior.

## 2. Escopo

1. **ViewModel e Lógica Pura de Ordenação (`src/viewmodel/searchFilters.ts`):**
   - Adição da opção `"neighborhood"` ao tipo `SearchSortOption`.
   - Adição do rótulo `"Bairros de Piripiri"` em `SORT_LABELS`.
   - Implementação de ordenação em `sortBooks(books, sortBy, preferredNeighborhood?)`:
     - Se houver `preferredNeighborhood` (bairro do leitor ou selecionado no topo), livros desse bairro têm prioridade 1 (aparecem primeiro).
     - Livros dos demais bairros são ordenados alfabeticamente pelo nome do bairro de Piripiri (prioridade 2).
     - Livros sem bairro ficam ao final (prioridade 3).
     - Desempate alfabético por título.

2. **Integração no ViewModel de Busca (`src/viewmodel/useSearchViewModel.ts`):**
   - Passar o bairro selecionado (`neighborhood`) para `sortBooks`.

3. **Interface Móvel (`SortSheet.tsx` e `FilterSheet.tsx`):**
   - Atualizar a lista `SORT_IDS` para incluir `"neighborhood"`.
   - Ordem expressiva:
     1. `"recent"` ("Mais recentes")
     2. `"price_asc"` ("Menor preço")
     3. `"price_desc"` ("Maior preço")
     4. `"neighborhood"` ("Bairros de Piripiri")
     5. `"title"` ("A-Z")

4. **Interface Web Desktop (`WebFilterSidebar.tsx` e `search.tsx`):**
   - Adicionar a seção "Ordenar por" na barra lateral desktop com chips acessíveis.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | `sortBooks` ordena por `neighborhood` priorizando o bairro preferido do leitor e ordenando os demais bairros de Piripiri alfabeticamente. | Testes unitários em `searchFilters.test.ts` |
| CA2 | `SortSheet` e `FilterSheet` exibem as 5 opções de ordenação com acessibilidade completa. | Testes de componente em `sortSheet.test.tsx` e `filterSheet.test.tsx` |
| CA3 | `WebFilterSidebar` exibe o grupo "Ordenar por" com seleção reativa de ordenação no desktop. | Teste de componente `webFilterSidebar.test.tsx` |
| CA4 | 100% dos testes da suíte e checagem de tipos/arquitetura passam sem regressões. | `npm test` e `npm run check:architecture` |
