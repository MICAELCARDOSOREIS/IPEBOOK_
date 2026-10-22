# Tarefas — Spec 043

- [x] ADR 0035 (substitui a decisão 1 da ADR 0008) + atualização do índice e da ADR 0008.
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

- [ ] Migrar os ~22 componentes restantes de `src/view/components/`.
- [ ] Migrar as ~47 telas restantes de `src/view/*`.
