# Validação — Spec 038

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/components/photoGallery.test.tsx` (8 testes):
  - contador "Foto X de Y" e estado dos botões Anterior/Próxima nos limites da lista;
  - rótulo de acessibilidade próprio por foto renderizada (`Foto 1 do anúncio`, `Foto 2 do
    anúncio`, `Foto 3 do anúncio`), corrigindo rótulo fixo que antes só refletia a foto em
    destaque;
  - navegação por "Anterior"/"Próxima";
  - swipe horizontal via `onMomentumScrollEnd`, sincronizando índice e botões (RN-01, critério 1);
  - fechamento por botão "Fechar";
  - navegação por teclado na Web: `ArrowRight`/`ArrowLeft` muda a foto, `Esc` fecha a galeria
    (RN-02, critério 2);
  - ausência de reação ao teclado fora da Web (RN-03).
- Ajuste no mock de teste `tests/mocks/react-native.{ts,cjs}`: `FlatList` passou a repassar
  `testID`, `horizontal`, `pagingEnabled`, `onMomentumScrollEnd`, `onScroll` e
  `accessibilityLabel` ao elemento renderizado — antes esses props eram descartados, impedindo
  testar swipe e localizar a lista por `testID`.

## Comandos executados

- `npx vitest run tests/` : **784 testes, 114 arquivos, todos aprovados.**
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0.

## Limitações

- Gesto de swipe real em dispositivo físico (iOS/Android) não verificado via ADB nesta entrega;
  apenas o contrato de `onMomentumScrollEnd` foi validado por teste automatizado.
- Navegação por teclado não verificada manualmente em navegador real; apenas o contrato de
  `document.addEventListener("keydown", ...)` foi validado por teste automatizado com documento
  simulado, no mesmo padrão já usado em `Dialog.tsx`.
