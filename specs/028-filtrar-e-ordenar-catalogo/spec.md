# Especificação 028: Filtrar e Ordenar o Catálogo de Livros (Issue #93)

## 1. Visão Geral e Contexto
Atualmente, o Ipebook exibe os anúncios do catálogo de livros na ordem em que são retornados pelo datasource, e a pesquisa textual realiza apenas filtragem por título e autor. Com o crescimento da quantidade de livros cadastrados em Piripiri, PI, torna-se essencial permitir que leitores filtrem anúncios por modalidade, categoria e faixa de preço, além de ordenar a listagem.

Esta especificação atende ao fluxo **02 · Descoberta** do Figma:
- `02.03 · Filtrar livros`
- `02.04 · Explorar com filtro`
- `02.05 · Busca sem resultado`

---

## 2. Critérios de Aceite

- **CA1 — Filtro por Modalidade:** Permitir filtrar por `Todas` (padrão), `Venda`, `Troca` e `Doação`.
- **CA2 — Filtro por Categoria:** Exibir categorias disponíveis dinamicamente no catálogo (ex.: Literatura, Didáticos, Ficção) mais a opção neutra `Todas`.
- **CA3 — Filtro por Preço:** Permitir selecionar faixas práticas de preço: `Todos`, `Gratuitos / Doação` (preço 0 ou modalidade doação), `Até R$ 20` e `Até R$ 50`.
- **CA4 — Ordenação Flexível:** Permitir ordenar por:
  - Mais recentes (`recent` — padrão)
  - Título alfabético (`title` — A a Z)
  - Menor preço (`price_asc`)
  - Maior preço (`price_desc`)
- **CA5 — Combinação Harmônica:** Os filtros devem combinar de forma cumulativa com o termo de busca digitado.
- **CA6 — Indicador e Ação de Limpeza:** Exibir visualmente quando houver filtros aplicados e disponibilizar botão acessível para "Limpar filtros", restaurando o estado padrão.
- **CA7 — Estado Vazio Contextualizado:** Quando nenhum anúncio atender aos critérios combinados, exibir mensagem informativa explicativa e botão para "Limpar filtros".
- **CA8 — Acessibilidade Digital (WCAG / Material 3):**
  - Alvos de toque com no mínimo 48 dp de dimensão efetiva (`hitSlop={8}`).
  - Anúncio de estado selecionado para leitores de tela (`accessibilityState={{ checked }}`).
  - Não depender exclusivamente de cores para diferenciar itens ativos (`✓ Rótulo`).

---

## 3. Arquitetura e Impacto
- **Camada Model/Entity:** Tipos `BookModality`, `Book` já contêm `modality`, `category` e `price`.
- **Camada ViewModel (`useSearchViewModel`):** Gerenciamento reativo dos filtros, ordenação e derivação das categorias disponíveis no catálogo.
- **Camada View (`src/view/search/search.tsx`):** Exibição dos filtros por chips, controle de ordenação e tratamento do estado vazio.
- **Testes:** Testes automatizados do ViewModel e da View cobrindo combinações de filtros, ordenação e limpeza.

---

## 4. Evolução (2026-10-26 — ADR 0057)

A entrega original resolvia os critérios CA1–CA8 em um painel embutido no Explorar, aberto pelo ícone de
ajustes. A conferência dos SVG `02.03 · Filtrar livros` e `02.04 · Explorar com filtro` mostrou outra
estrutura, e a leitura no Galaxy A16 revelou problemas de uso que o painel escondia: categorias fixas que
não existiam no catálogo, recarga da lista a cada toque sem contagem de resultados, "Limpar filtros"
apagando o termo digitado e ordenação contada como filtro.

O que mudou, sem alterar os critérios de aceite:

- **CA1/CA2/CA3/CA4** passam a ser escolhidos na tela própria `Filtrar livros` (`FilterSheet`), com
  rascunho aplicado só ao tocar em **"Mostrar N livros"**. A fileira de categorias do Explorar passa a ser
  extraída do catálogo carregado, e a ordenação sai da tela de filtros para a folha `SortSheet`.
- **CA5** permanece: termo, bairro e os quatro filtros continuam cumulativos.
- **CA6** ganha os **chips removíveis** de `02.04` (modalidade, condição e preço) e um distintivo com a
  quantidade de filtros ativos no ícone de ajustes. `resetFilters` limpa filtros e ordenação preservando
  termo e bairro; `clearFilters` continua reiniciando a busca inteira.
- **CA7** separa três mensagens de estado vazio (filtros, termo e catálogo vazio), com a ação
  "Limpar filtros e buscar novamente".
- **Novo — filtro de conservação:** "Somente bom estado" (`condition: "good"`), incluindo anúncios sem
  conservação gravada, porque o detalhe do anúncio já os apresenta como "Bom estado".
- **CA8** se mantém, agora também no `radiogroup` de conservação e nas linhas de opção de 48 dp.

Implementação: `src/viewmodel/searchFilters.ts` (lógica pura), `useSearchViewModel` (estado, rascunho e
ações), `src/view/search/FilterSheet.tsx`, `src/view/search/SortSheet.tsx` e `Chip` com variante de 40 dp.
Cobertura em `tests/unit/searchFilters.test.ts`, `tests/hooks/useSearchViewModel.test.tsx` e
`tests/components-mocked/searchView.test.tsx` (suíte completa com 168 arquivos / 1180 testes).
