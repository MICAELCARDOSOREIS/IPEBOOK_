# Relatório de Alinhamento — Grupo F: Descoberta, Filtros e Alertas

**Status:** Concluído com sucesso (40/40 testes aprovados)  
**Telas cobertas:** 02.01–02.16, 10.01–10.03, 11.01–11.05  
**Data:** 25/10/2026

## Telas Verificadas e Alinhadas
1. **02.01 · Início (`src/view/home.tsx`)**:
   - Barra superior com Pill de seleção de bairro (`Centro v`), Sino de Notificações à direita e botão `Entrar` apenas quando deslogado.
   - Eliminados da barra superior atalhos quebrados e cabeçalho antigo com e-mail/Anunciar/Sair, respeitando o padrão canônico do Figma.
   - Hero editorial com tipografia de marca (`Source Serif 4`, 34px), campo de busca com cantos arredondados full e chips de filtro rápido (Todos, Venda, Troca, Doação).
   - Carrossel de recém-adicionados e banner comunitário "Doações da semana" com rota para busca filtrada.
2. **02.02–02.05 · Pesquisa e Filtros (`src/view/search/search.tsx`, `SearchField.tsx`)**:
   - Filtros de modalidade (Venda, Troca, Doação), bairros de Piripiri, categorias e ordenação.
   - Apresentação de cards com selo de bairro e moeda brasileira formatada (`R$ 25,00`).
3. **02.06, 02.14 · Favoritos (`src/view/favorites/favorites.tsx`)**:
   - Abas e lista de itens salvos com ações de remoção e navegação direta para o anúncio.
4. **02.07–02.13 · Alertas de Busca (`searchAlerts.tsx`, `manageAlert.tsx`, `editAlert.tsx`)**:
   - Listagem de alertas ativos e modais de criação/edição com critérios de busca e notificações.

## Testes Automatizados Validados
- `tests/components-mocked/homeSessionIndicator.test.tsx` (4/4 passaram)
- `tests/integration/homeIntegration.test.tsx` (2/2 passaram)
- `tests/components-mocked/searchView.test.tsx` (15/15 passaram)
- `tests/components/favoritesAlertsView.test.tsx` (9/9 passaram)
- `tests/components/searchField.test.tsx` (4/4 passaram)
- `tests/components-mocked/favoritesViewMocked.test.tsx` (6/6 passaram)

