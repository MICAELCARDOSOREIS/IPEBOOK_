# Validação — Spec 043

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/unit/themeContrast.test.ts`: 17 pares de contraste (texto/superfície, M3, badges) nos
  dois temas, todos ≥4.5:1 (WCAG AA).
- `tests/unit/themePreferenceUseCases.test.ts`: começa em "system"; persiste escolha manual; cai
  em "system" se a leitura falhar; não lança erro se a gravação falhar.
- `tests/unit/asyncStorageThemePreferenceDataSource.test.ts`: lê/grava a preferência no
  AsyncStorage; retorna "system" quando o valor salvo é inválido ou ausente.
- `tests/hooks/useThemeViewModel.test.tsx`: segue o tema claro/escuro do sistema quando a
  preferência é "system"; ignora o sistema quando há escolha manual; persiste a troca.
- `tests/components/homeThemeToggleView.test.tsx`: alternador de tema na Home mostra as três
  opções com o estado selecionado correto e alterna ao tocar.
- Testes pré-existentes de Home, NavigationBar (indireto via Home) e BookCover continuam
  aprovados sem alteração de comportamento fora do Provider (fallback ao tema claro).

## Comandos executados

- `npm run typecheck`: aprovado.
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0. **918 testes em 130 arquivos, todos aprovados.** Cobertura:
  Statements 91.45%, Branches 83.46%, Functions 88.71%, Lines 92.91%.
- `npm run build:web`: aprovado.

## Limitações

- Verificação visual manual em dispositivo/navegador real (alternando o tema do sistema
  operacional) não realizada nesta entrega — o comportamento foi validado via o contrato de
  `useColorScheme`/`AsyncStorage`, mockados nos testes automatizados.
- Escopo desta entrega: apenas a Home e os componentes que ela usa diretamente (`BookCover`,
  `ErrorState`, `FavoriteButton`, `LoadingState`, `OfflineState`, `NavigationBar`) foram migrados
  para o tema dinâmico. As demais ~47 telas e ~22 componentes continuam no tema claro fixo até
  serem migrados em issues de acompanhamento (ver `tasks.md`).
