# Tarefas — Spec 054

- [x] ADR 0036 (substitui a decisão 1 da ADR 0008) + atualização do índice e da ADR 0008.
- [x] `ThemePreference` (model) + datasources (memory/AsyncStorage) + usecase + wiring no container.
- [x] `darkColors` em `tokens.ts`, derivado de `design-system/tokens.json` (coluna `dark`).
- [x] `contrastRatio.ts` + `tests/unit/themeContrast.test.ts` (17 pares, claro e escuro, ≥4.5:1).
- [x] `useThemeViewModel` (resolve system/light/dark) + testes.
- [x] `ThemeProvider`/`useTheme` (Context) + wiring em `src/app/_layout.tsx`.
- [x] Migração: `NavigationBar`, `BookCover`, `ErrorState`, `FavoriteButton`, `LoadingState`,
      `OfflineState`, `home.tsx`.
- [x] Alternador de tema (Sistema/Claro/Escuro) na Home, persistido.
- [x] Testes do alternador (`tests/components/homeThemeToggleView.test.tsx`).

## Acompanhamento (fora desta entrega)

- [x] Migrar os componentes de `src/view/components/` (conferido em 2026-11-05): 41 dos 55
      componentes leem `useTheme`. Os 14 restantes estão fora do tema por natureza — dez não
      declaram cor alguma (`ConnectedNavigationBar`, `ConnectedWebHeader`, `RequireAuth`,
      `PushRegistration`, `PwaRegister`, `Icon`, `FluentIcon`, `GoogleLogo`,
      `IpeCelebrationOverlay` e `IpeMark`, este último um PNG decorativo) e quatro pintam o que
      deve ser igual em qualquer tema: `Book3D`, `InviteCard` e `ListingShareCard` usam
      `tokens.colors` do claro de propósito, como registra o comentário do `InviteCard`, e o
      `QrCode` precisa de preto sobre branco para ser legível por leitor de código.
- [x] Migrar as telas de `src/view/*` (conferido em 2026-11-05): 73 dos 86 arquivos de tela leem
      `useTheme`; os 13 restantes são invólucros de composição que não pintam superfície — os dez
      `*Screen.tsx`, os dois portões de rota (`welcomeRoute.tsx`, `initialRouteGate.tsx`) e o
      navegador de fotos (`photoGallery.tsx`), escuro nos dois temas por ser um visualizador em
      tela cheia. Das 15 linhas com cor hexadecimal dentro de `src/view/`, uma é comentário e as
      outras 14 são `shadowColor: "#000000"` (2), o QR code (2), o fundo preto da câmera e do
      navegador de fotos (2) e texto branco sobre essas superfícies escuras (8) — nenhuma é cor de
      superfície do aplicativo.
