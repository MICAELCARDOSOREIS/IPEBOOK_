# Spec 038 — Galeria de fotos com gestos de navegação e swipe lateral (Figma fluxo 03)

**Responsável:** Maria Clara (`pessoa:maria-clara`)
**Data:** 21 de outubro de 2026
**Issue:** #143
**Tela no Figma:** `03.02 · Galeria de fotos em tela cheia`.

## Problema

`PhotoGallery` (`src/view/listings/photoGallery.tsx`) exibe uma foto por vez com botões "Anterior"
e "Próxima", mas não permite transição por swipe horizontal no mobile, não responde a teclado na
Web (setas e Esc) e o rótulo de posição ("1 de 3") não é explícito o bastante para leitores de
tela.

## Escopo

- Substituir a imagem única por `FlatList` horizontal com paginação (`pagingEnabled`), permitindo
  swipe lateral fluido entre fotos.
- Manter os botões "Anterior"/"Próxima" sincronizados com a posição do swipe (clique ou gesto levam
  ao mesmo estado).
- Indicador textual de posição no formato "Foto X de Y", visível e acessível.
- Navegação por teclado na Web: `Seta direita`/`Seta esquerda` avança/volta foto, `Esc` fecha a
  galeria (mesmo padrão já usado em `Dialog.tsx`).
- Rótulo de acessibilidade individual por foto da lista (`Foto N do anúncio`), coerente com a foto
  real renderizada, não apenas com a foto atualmente em destaque.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Swipe):** arrastar horizontalmente no mobile muda a foto exibida e atualiza o indicador
  de posição e o estado dos botões "Anterior"/"Próxima".
- **RN-02 (Teclado Web):** com a galeria visível e `Platform.OS === "web"`, `ArrowRight` avança,
  `ArrowLeft` volta (respeitando os limites da lista) e `Escape` aciona `onClose`.
- **RN-03 (Fora da Web):** teclas não têm efeito em iOS/Android (ausência de teclado físico padrão;
  a navegação nativa já é feita por gesto e pelos botões).
- **RN-04 (Acessibilidade):** cada foto da lista tem `accessibilityLabel` próprio ("Foto N do
  anúncio") e o indicador textual de posição é "Foto X de Y".

## Critérios de Aceite

1. Swipe horizontal nas fotos funciona e mantém o indicador de posição e os botões consistentes
   com a foto exibida.
2. Na Web, `ArrowRight`/`ArrowLeft` navegam entre fotos e `Esc` fecha a galeria.
3. Cada foto da galeria tem rótulo acessível próprio; o indicador textual segue o formato
   "Foto X de Y".
4. Testes cobrem a transição de fotos (swipe e teclado) e o fechamento do modal.
5. `npm run validate` passa.

## Validação

- Teste de componente cobrindo swipe (`onMomentumScrollEnd`), navegação por teclado (`ArrowRight`,
  `ArrowLeft`, `Escape`) e rótulos de acessibilidade por foto.
- `npm run validate`.
