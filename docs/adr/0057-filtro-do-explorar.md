# ADR 0057 — Experiência de filtro do Explorar (Filtrar livros e filtros aplicados)

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 028 (critérios CA1–CA8), Spec 072, etapa 4 (ver
  `specs/072-alinhamento-global-figma/tasks.md`).
- **Relacionado a:** ADR 0049 (alinhamento do Explorar ao Figma 02.02), ADR 0055 (alinhamento global)
  e ADR 0056 (componentes compartilhados).

## Contexto

A Spec 028 entregou os filtros de modalidade, categoria, preço e ordenação dentro de um painel que
só aparecia depois de tocar no ícone de ajustes do Explorar. Ao medir as telas `02.03 · Filtrar livros`
e `02.04 · Explorar com filtro` nos SVGs de `design-system/figma-exports/svgs/`, o desenho do Figma é
outro: filtros em uma tela própria, com a contagem de resultados no botão principal, e os filtros já
aplicados aparecendo como chips removíveis sobre a lista.

A conferência no Galaxy A16 mostrou problemas que o painel embutido escondia:

- os chips rápidos eram fixos ("Ficção", "Não ficção", "Infantil", "Didático") e não correspondiam às
  categorias reais do catálogo (`Literatura Brasileira`, `Infantojuvenil`, `Ciências Exatas`…), o que
  podia devolver lista vazia sem explicação;
- cada mudança de filtro recarregava a lista imediatamente, sem indicação de quantos resultados
  sobreviveriam àquele conjunto;
- "Limpar filtros" apagava também o termo digitado, e a ordenação entrava na conta de "filtros ativos"
  e era desfeita junto;
- a conservação do exemplar, que o Figma `02.03` oferece ("Somente bom estado"), não tinha filtro;
- o ícone de ajustes não indicava quantos filtros estavam aplicados.

## Decisão

1. **Tela `Filtrar livros` (modal de tela cheia, Figma `02.03`)** aberta pelo ícone de ajustes do
   Explorar, com manchete editorial, modalidade, categoria (dinâmica), condição do livro, preço e
   ordenação. As escolhas ficam em um **rascunho** (`draftFilters`) que só vale ao tocar em
   **"Mostrar N livros"**, com `N` recalculado a cada toque. Voltar pela barra superior descarta o
   rascunho; "Limpar filtros" limpa tudo e retorna à lista completa.
2. **Uma única fileira de chips no Explorar**: "Todos" + categorias extraídas do catálogo carregado
   (Figma `02.02`), eliminando a lista fixa de categorias inexistentes.
3. **Filtros aplicados como chips removíveis** (Figma `02.04`) para modalidade, condição e preço. A
   categoria fica de fora da fileira de chips porque já aparece selecionada com check na fileira
   acima; repeti-la duplicaria o mesmo estado em dois lugares da tela.
4. **Resumo da faixa de resultados + ordenação** (`"3 livros à venda · Bom estado"` e
   `"Mais recentes"`), com a ordenação em uma folha própria (`SortSheet`). A ordenação deixa de contar
   como filtro: não aparece nos chips, não é desfeita ao remover um filtro e sobrevive ao
   `resetFilters` apenas até o próximo "Limpar filtros".
5. **`hasActiveFilters` passa a considerar só o que restringe resultados** (termo, bairro e os quatro
   filtros). `resetFilters` limpa filtros e ordenação preservando termo e bairro; `clearFilters`
   continua recomeçando a busca inteira e é o que os estados vazios oferecem.
6. **"Somente bom estado" inclui anúncios sem conservação informada**, porque o detalhe do anúncio
   (`bookDetail.tsx`) já apresenta esse caso como "Bom estado"; excluí-los aqui contradiria a tela.
7. A lógica pura de filtro, ordenação e descrição vive em `src/viewmodel/searchFilters.ts`; o
   `useSearchViewModel` só guarda estado e expõe as ações.

## Consequências

- Aplicar filtros exige um toque a mais ("Mostrar N livros"), em troca de nunca entregar uma lista
  vazia no meio da escolha e de deixar explícita a quantidade de resultados.
- `Chip` ganhou a variante `size="regular"` (40 dp) para a tela de filtros, mantendo 32 dp nas
  fileiras do Explorar e da Home.
- O estado de filtros continua local ao Explorar: abrir a tela de filtros não cria rota nem duplica
  estado em parâmetros de navegação.
- Dois novos recortes de tela (`FilterSheet`, `SortSheet`) entram em `src/view/search/`, ambos
  alimentados pelo viewmodel; testes de view cobrem rascunho, aplicação, remoção por chip, resumo e
  ordenação, e testes puros cobrem `searchFilters`.
- `design-system/04-componentes/chip.md` e `design-system/05-padroes.md` passam a descrever os tamanhos
  do chip e o padrão de filtragem.

## Alternativas consideradas

- **Manter o painel embutido sob o ícone de ajustes:** é menos código, mas não tem contagem, não
  comporta cinco grupos de opções sem empurrar a lista inteira para baixo e não reproduz `02.03`.
- **Criar uma rota `/filtrar` com os filtros em parâmetros de navegação:** separa a tela do estado,
  porém exige serializar/desserializar filtros a cada abertura e duplicar a fonte de verdade entre a
  rota e o `useSearchViewModel`.
- **Multi-seleção de categorias e modalidades:** amplia o poder de busca, mas o Figma `02.03` mostra
  escolha única por grupo e o catálogo de Piripiri ainda tem poucas categorias.
- **Filtro de conservação estrito (só `condition === "good"`):** tecnicamente mais simples, mas
  esvaziaria o filtro para os anúncios antigos, que não têm conservação gravada e são exibidos como
  "Bom estado" no detalhe.
