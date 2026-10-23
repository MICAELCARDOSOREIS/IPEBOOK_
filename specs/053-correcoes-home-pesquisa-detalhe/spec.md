# Spec 053 — Correções de layout e privacidade na Home, Pesquisa e Detalhe

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 22 de outubro de 2026
**Origem:** análise do aplicativo em aparelho real (Samsung SM-A165M, Android 16, Expo Go 57.0.9)
via `adb`, em 22/10/2026.

## Exceção de escopo (decisão registrada)

As Specs 044 e 045 declaram `src/view/home.tsx`, `src/view/search/search.tsx` e
`src/view/listings/bookDetail.tsx` como arquivos sob responsabilidade da Maria Clara
(`pessoa:maria-clara`), proibidos para o Micael. **Os seis defeitos desta spec estão todos nesses
três arquivos.**

O Micael autorizou expressamente, em 22/10/2026, corrigir e integrar normalmente, cientes de que
isso atravessa a fronteira das Specs 044/045. Esta seção existe para que a Maria Clara e os demais
agentes saibam que a exceção foi deliberada, pontual e limitada aos defeitos abaixo — a fronteira
permanece válida para qualquer outro trabalho.

## Problema

Os defeitos só aparecem com layout real: a suíte (1032 testes) e o `typecheck` passavam com todos
eles presentes, porque os testes rodam sem medir altura de tela.

| # | Severidade | Defeito | Arquivo |
|---|------------|---------|---------|
| 1 | Bloqueador | A Home não rola. Sem `ScrollView`/lista raiz, a `FlatList` de "Livros" colapsava para **altura 0** (medido: `Rect(68,2052 - 1013,2052)`) e o rodapé ficava cortado pela barra de abas. O catálogo era inalcançável no celular. | `src/view/home.tsx` |
| 2 | Bloqueador | A Pesquisa não rola. Busca e filtros ocupam ~1500px de 2340 e a lista de resultados ficava com **146px** — um resultado aparecia cortado ao meio. | `src/view/search/search.tsx` |
| 3 | Alta | O detalhe exibia o UUID de quem anunciou: *"Anunciado por 665e6478-544a-4ede-9dbb-185e3435430a"*. | `src/view/listings/bookDetail.tsx` |
| 4 | Média | As setas ‹ › do carrossel desalinhavam: `scrollToOffset` usava só a largura do card e ignorava a margem de 12dp entre eles, acumulando desvio a cada clique (medido: 33px por clique, 135px após 4). | `src/view/home.tsx` |
| 5 | Média | Título longo de seção sobrepunha o "Ver mais" ("Doações disponíveis na comunidade" terminava exatamente onde o "Ver mais" começava). | `src/view/home.tsx` |
| 6 | Média | O card do carrossel tem 152dp, mas usava `BookCover variant="list"` (44dp): capa minúscula, vazio à direita e tag esticada. | `src/view/home.tsx` |

## Comportamento esperado

- **CA-01:** A Home rola em um único gesto, do topo ao rodapé, com a lista de livros alcançável e
  os links de Termos e Ajuda inteiros acima da barra de abas.
- **CA-02:** A Pesquisa rola em um único gesto; filtros e resultados pertencem à mesma superfície.
- **CA-03:** O detalhe mostra o nome público de quem anunciou. Sem nome disponível (carregando ou
  falha), usa "Anunciado por outro membro da comunidade" — **o identificador interno nunca vai
  para a tela**.
- **CA-04:** Cada clique na seta do carrossel alinha o item seguinte à borda esquerda, sem desvio
  acumulado.
- **CA-05:** O título da seção e o "Ver mais" nunca se sobrepõem, mesmo com título longo.
- **CA-06:** A capa preenche a largura do card do carrossel; a tag acompanha o texto.

## Decisões de implementação

1. **Rolagem (CA-01, CA-02):** o cabeçalho (e, na Home, o rodapé) passou a viajar dentro da própria
   lista, por `ListHeaderComponent`/`ListFooterComponent`. Evita `VirtualizedList` dentro de
   `ScrollView` — que o React Native desaconselha — e preserva a virtualização do catálogo. O
   `contentContainerStyle` usa `flexGrow: 1` (e não `flex: 1`, que impedia a rolagem).
2. **Estados de carregamento/erro:** migraram para `ListEmptyComponent` com `data` vazia, mantendo
   o comportamento anterior sem duplicar a árvore.
3. **Nome de quem anunciou (CA-03):** subcomponente `OwnerLink` consome
   `usePublicProfileViewModel`, respeitando as camadas do MVVM (`npm run check:architecture`).
4. **Carrossel (CA-04):** `CAROUSEL_ITEM_STRIDE = largura + margem`, exposto como
   `carouselOffsetFor(index)` para poder ser testado sem layout.
5. **Capa (CA-06):** nova variante `carousel` (152dp) no `BookCover`, alinhada ao card.

## Verificação

- `npm run typecheck`, `npm run check:architecture` e a suíte completa (**1037 testes**, 146
  arquivos) passando.
- O mock de `FlatList` em `tests/mocks/` passou a renderizar `ListHeaderComponent` e
  `ListFooterComponent` — antes os ignorava, o que mascarava qualquer conteúdo movido para eles.
  Isso **fortaleceu** o mock; nenhum teste foi enfraquecido ou removido.
- `tests/unit/homeCarouselOffset.test.ts` cobre o CA-04. A detecção foi confirmada reintroduzindo o
  cálculo antigo em ambiente isolado: 2 dos 3 casos falharam; a correção foi restaurada em seguida.
- `tests/components-mocked/bookDetailView.test.tsx` ganhou dois casos para o CA-03, incluindo a
  regressão explícita de que o UUID não aparece na tela.
### Verificação em aparelho real (Samsung SM-A165M, Android 16, via `adb`)

| Critério | Antes | Depois |
|----------|-------|--------|
| CA-01 | `ScrollView scrollable=false`; lista de livros em altura 0; rodapé cortado | Rola em um gesto; os 5+ livros do catálogo aparecem; rodapé inteiro |
| CA-02 | `scrollable=false`; um resultado cortado ao meio | Rola; 7 resultados com título, autor, categoria, preço e tag |
| CA-03 | "Anunciado por 665e6478-544a-4ede-9dbb-185e3435430a" | "Anunciado por outro membro da comunidade"; nenhum UUID na árvore de acessibilidade |
| CA-04 | Card alvo em `left=` 247 → 282 → 315 → 349 (desvio acumulado) | `left=214` nos quatro cliques |
| CA-05 | Título até x=903, "Ver mais" de 903 a 1038 (transbordava a tela) | Título quebra em duas linhas até x=878; "Ver mais" termina em 1013 |
| CA-06 | Capa de 124px num card de 427px, tag esticada | Capa preenche o card; tag justa ao texto |

## Pendência conhecida

`v2_profiles` não retorna linhas em leitura anônima (verificado por consulta direta à API REST).
Deslogado, o CA-03 sempre cai no rótulo genérico. Isso **resolve o vazamento do identificador**,
mas exibir o nome real de quem anunciou depende de revisar a política de RLS dessa tabela —
trabalho de backend, fora do escopo desta spec.

## Integração com a Spec 055 (tema escuro em todo o app)

Durante esta entrega, o PR #195 concluiu em `develop` a migração do tema escuro para as ~47 telas
restantes — justamente o item que esta spec havia classificado como backlog. Como ele tocou
`search.tsx` e `bookDetail.tsx`, houve conflito, resolvido preservando as duas mudanças:

- `search.tsx`: mantida a `createStyles(colors)` da Spec 055 e, dentro dela, o `content` com
  `flexGrow` (o que permite a rolagem) e o `filters` com o `gap` que saiu do container. O estilo
  `list` ficou órfão com a migração para `ListHeaderComponent` e foi removido.
- `bookDetail.tsx`: o merge automático deixou o `OwnerLink` referenciando o `styles` do módulo,
  que a Spec 055 passou a criar dentro do componente — um defeito que o merge introduziria em
  silêncio. O `OwnerLink` passou a resolver o próprio tema com `useTheme` + `createStyles`.

Resultado: Pesquisa e Detalhe têm tema escuro **e** rolagem ao mesmo tempo. O item "tema escuro
parcial", levantado na análise original, deixa de existir.
