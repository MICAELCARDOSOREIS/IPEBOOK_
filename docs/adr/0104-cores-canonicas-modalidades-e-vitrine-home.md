# 0104 — Cores canônicas das modalidades e fidelidade visual da vitrine da Home

- **Data:** 2026-11-09
- **Status:** Aceito

## Contexto

A identidade visual do IpêBook (Figma `02.01 · Início`, Spec 062, Spec 078) possui uma metáfora botânica e comunitária fortemente ancorada na cidade de Piripiri: a florada dourada do Ipê-Amarelo, o verde botânico da folhagem e o marrom nobre da encadernação e do tronco.

Durante refinamentos de interface, as caixas cromáticas que delimitavam a área superior da capa dos livros no carrossel (`CatalogCarousel`) haviam sido temporariamente neutralizadas para um tom cinza/bege genérico, e o banner comunitário de "Doações da semana" estava usando um tom pastel rosado (`doacao-container`) desbotado que não refletia a florada solar viva da marca. Adicionalmente, os pontos indicadores dos chips de filtro rápido na Home não correspondiam com fidelidade às cores canônicas de cada modalidade.

## Decisão

1. **Cores canônicas das modalidades na vitrine (`CatalogCarousel.tsx`):**
   - **Venda:** Área superior sob a capa (`carouselCardCoverArea`) no Verde Folhagem Profundo (`#1E4E27`, `tokens.colors.nature.foliageDeep`) e badge em pílula verde com texto branco (`#FFFFFF`).
   - **Troca:** Área superior sob a capa no Marrom Tronco/Couro (`#58331F`, `tokens.colors.brandBrown`) e badge em pílula marrom com texto branco (`#FFFFFF`).
   - **Doação:** Área superior sob a capa no Amarelo Ouro Solar (`#F5B718`, `tokens.colors.ipe.bloom`) e badge em pílula dourada com texto marrom tronco de alto contraste (`#451A03`, razão 8,3:1 WCAG AAA).

2. **Banner "Doações da semana" e Florada do Ipê (`ipe-bloom` = `#F5B718`):**
   - Fixar o valor canônico `#F5B718` (RGB `245, 183, 24`) em `colors.ipe.bloom`, `tokens.json` e `badge.donation.background`.
   - O banner de "Doações da semana" adota fundo `#F5B718`, círculo branco com ícone de marcador e textos no marrom tronco profundo (`#451A03`), assegurando contraste de 8,3:1 e máxima legibilidade.

3. **Pontos indicadores (`dot`) dos chips de filtro rápido ([`Chip.tsx`](../src/view/components/Chip.tsx)):**
   - Preenchimento sólido e circular nos chips inativos: Verde escuro (`#1E4E27`) para Venda, Marrom escuro (`#58331F`) para Troca e Amarelo ouro (`#F5B718`) para Doação.
   - O chip "Todos", quando selecionado, preserva o fundo verde menta suave (`secondaryContainer`, `#D2EBD4`) com check e texto em verde escuro.

4. **Barra de navegação flutuante (`NavigationBar.tsx`):**
   - Cápsula suspensa com fundo em superfície suave (`colors.surface`, `#FCFAF5`), elevação 6 e rótulo ativo em destaque com o verde da marca (`colors.m3.primary`, `#2B6334`).

## Consequências

- **Positivas:**
  - Fidelidade visual absoluta ao design system e à identidade de Piripiri.
  - Reconhecimento imediato da modalidade do livro (Venda, Troca, Doação) tanto pela capa quanto pelas tags e filtros.
  - Conformidade plena com as diretrizes de acessibilidade WCAG AAA de contraste de cores.
- **Negativas / Trade-offs:**
  - Nenhuma; a suíte completa de 2.180 testes automatizados em 307 arquivos continua 100% verde.
