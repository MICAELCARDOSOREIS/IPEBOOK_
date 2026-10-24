# ADR 0049 — Alinhamento Visual da Tela Explorar (Pesquisa) ao Figma 02.02

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 066 (Alinhamento Visual do Explorar), Figma `02.02 · Explorar` (`10:2`).
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0007 (Serifa da Marca), ADR 0011 (Navegação de Destinos), ADR 0019 (Componentes e MVVM), ADR 0045 (Alinhamento Visual Home).

---

## Contexto

A tela de exploração e pesquisa (`src/view/search/search.tsx`) é um dos destinos principais de descoberta no IpêBook. No design canônico do Figma `02.02 · Explorar` (`10:2`), a tela apresenta:
- Barra de topo com o seletor de bairro em pílula (`Centro ⌄`) à esquerda e o botão de filtros avançados (`tune`) circular à direita;
- Manchete editorial serifada em destaque (*"O que vamos\nler hoje?"*) seguida pelo subtítulo descritivo;
- Campo de pesquisa Material 3 com ícone de lupa (*leading icon* `search`) e chips de categorias rápidas em carrossel horizontal;
- Cartões de livros fechados em contêineres arredondados (`rounded-[16px]`), com capa ilustrada, título em serifa, autor, tags de modalidade/preço e ações dedicadas (favorito e seta indicativa).

## Decisão

1. **Barra de Topo com Bairro e Filtros:**
   - Adicionar barra superior contendo a pílula de localização (`neighborhoodPill`) com ícone `place`, nome do bairro ativo e seta `chevronDown`, alinhada à esquerda.
   - Posicionar o botão de filtros avançados (`tune`) no canto superior direito, com área de toque mínima de 48dp e destaque visual quando ativo.
   - Preservar o botão "Limpar filtros" quando houver filtros aplicados.

2. **Manchete Editorial Serifada:**
   - Aplicar a serifa da marca (`tokens.fontFamily.brand`, 34px, altura de linha 41px) para o título principal *"O que vamos\nler hoje?"*, sem combinação com `fontWeight` no Android para evitar fallback de fonte nativa.
   - Subtítulo em `bodyLarge` / `secondaryText`.

3. **Campo de Busca e Categorias Rápidas:**
   - `SearchField` com ícone de lupa integrado à esquerda (`AppIcon name="search"`).
   - Chips rápidos de categorias em linha horizontal com rolagem (`ScrollView` horizontal).

4. **Cartões de Livros Confinados (`card`):**
   - Cartões com contêiner próprio (`backgroundColor: colors.surface`, `borderRadius: 16`, `borderWidth: 1`, `borderColor: colors.m3.outlineVariant`, `paddingLeft: 12`, `paddingRight: 4`, `paddingVertical: 12`, `marginBottom: 12`, sombra sutil M3).
   - Título do livro em serifa da marca (`tokens.fontFamily.brand`, 19px, line-height 24px).
   - Tag de modalidade e valor claramente destacados.
   - Coluna de ações à direita com botão de favoritar e chevron para detalhes.

## Consequências

- **Positivas:**
  - Plena conformidade visual com o Figma `02.02 · Explorar`.
  - Coerência visual entre a Home (`02.01`), o Explorar (`02.02`), a Estante (`05.01`) e o Perfil (`07.01`).
  - Navegação e toque mais confortáveis no celular real.
- **Negativas / Limitações:**
  - Nenhuma regressão; todos os testes unitários e de componente continuam cobertos.

