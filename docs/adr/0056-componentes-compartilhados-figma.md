# ADR 0056 — Componentes compartilhados alinhados ao Figma Android

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 072, etapa 3 (ver `specs/072-alinhamento-global-figma/tasks.md`).
- **Relacionado a:** ADR 0004 (design system e tokens), ADR 0055 (alinhamento global, item 3), ADRs 0045,
  0047, 0048, 0049 e 0052 (alinhamentos por tela).

## Contexto

A ADR 0055 organizou o alinhamento por telas e proibiu, dentro dos grupos, alterar componentes
compartilhados e tokens; essas mudanças ficaram para uma etapa única posterior. Ao medir os 170 SVGs
de `design-system/figma-exports/svgs/` contra o app em execução, os desvios maiores não estavam nas
telas, e sim nos componentes usados por todas elas:

- o fundo das telas era `#F6F1E8` (`background`), mas o Figma usa `#FCFAF5` — exatamente o `surface`
  documentado em `design-system/tokens.json` como "fundo das telas e da barra superior";
- o `TextField` era uma caixa com rótulo fixo acima, e o Figma usa campo contornado M3 com rótulo
  flutuante recortado na própria borda (56 dp, raio 4);
- `TopAppBar` (altura, título e botão voltar), botões (52 dp), `Chip` (32 dp, raio 8) e
  `NavigationBar` (barra em `surface-container`, indicador 56x32) divergiam em medidas;
- a capa ilustrativa usava proporção 120:170 e raio 18, enquanto o Figma usa 5:8 com canto ~4 dp.

## Decisão

1. `background` e `surface` passam a ser o mesmo tom no tema claro (`#FCFAF5`). O tema escuro segue
   intacto (`#151311` de fundo).
2. `TextField` é um campo contornado M3: 56 dp de altura, raio 4 (`radius.extraSmall`), borda de 1 dp
   `outline` e 2 dp em foco/erro, rótulo flutuante de 12 dp recortado na borda e rótulo "de repouso"
   dentro do campo quando vazio. O contrato de acessibilidade (`aria-describedby`/`nativeID` do
   `helperText`/`errorText`) é preservado.
3. `TopAppBar` usa 64 dp de barra, título de 22 dp e botão voltar circular de 40 dp; `FilledButton` e
   `OutlinedButton` têm 52 dp com borda `outlineVariant`; `Chip` tem 32 dp, raio 8 e fundo branco;
   `NavigationBar` usa `surfaceContainer`, indicador de 56x32 e rótulo abaixo do ícone.
4. A capa ilustrativa passa a 5:8 (lista 56x90, card 74x119, detalhe 97x155) com canto de 4 dp. O texto
   sobre a capa continua restrito ao card grande: em 56 dp de largura ele ficaria ilegível e
   duplicaria o título que a própria linha já exibe.
5. As setas do carrossel da Home, que o Figma não mostra, saem do fluxo e ficam invisíveis sobre o
   título da seção. Ficam alcançáveis por leitor de tela e teclado sem interceptar o toque dos cards
   nem deslocar a faixa de dois cards visíveis.

## Consequências

- Uma mudança em `src/view/tokens.ts` ou em um desses componentes corrige todas as telas de uma vez,
  o que reduz o esforço restante do alinhamento.
- O fundo mais claro (`#FCFAF5`) preserva o contraste do texto principal (`#1D1B18`/`#3C302A`) e é o
  mesmo valor já usado nas barras de topo, mantendo a hierarquia visual.
- Campos de formulário ficam mais altos e com rótulo menor; textos de `helperText` precisam continuar
  curtos para caber em 56 dp.
- A capa de lista fica menor (56x90); telas que dependem dela para identificar o livro contam também
  com o título ao lado.
- `design-system/04-componentes/campo-de-texto.md`, `capa-ilustrativa.md` e `docs/design-system.md`
  passam a descrever o comportamento novo.

## Alternativas consideradas

- **Manter `background` como `#F6F1E8` e ajustar só as telas:** exigiria repetir a cor em cada View,
  contrariando o token único e deixando as barras de topo (`surfaceContainerLow`) com contraste
  inconsistente.
- **Rótulo fixo acima do campo:** mais simples de ler, mas não é o componente do Figma nem o padrão
  Material 3 usado no restante do app.
- **Renderizar as ilustrações das capas (sol, folhas) em vetor:** fiel ao Figma, porém exigiria
  adicionar `react-native-svg` e redesenhar 5 motivos; ficou fora do escopo desta etapa.
