# Spec 139 — Remoção do Tema Escuro (Operação Exclusiva em Tema Claro)

- **Status:** Concluída
- **Data:** 2026-11-18
- **ADR relacionado:** [ADR 0114 — Remoção do tema escuro: operação exclusiva em tema claro editorial](../../docs/adr/0114-remocao-do-tema-escuro.md) (substitui o ADR 0036)

## 1. Objetivo

Remover o suporte ao tema escuro do IpêBook em todas as camadas (configuração nativa/Web, tokens de UI, provedor de tema, casos de uso, fontes de dados locais, container de DI e views), garantindo que o aplicativo opere exclusivamente no tema claro editorial (`colors`).

## 2. Escopo

- **Configuração do aplicativo (`app.json` e `src/app/_layout.tsx`):**
  - Alterar `"userInterfaceStyle"` de `"automatic"` para `"light"` em `app.json`.
  - Fixar `StatusBar` com `style="dark"` em `src/app/_layout.tsx`.
- **Tokens e tema (`src/view/tokens.ts`, `src/view/theme/ThemeProvider.tsx`, `src/view/categoryTone.ts`):**
  - Remover `darkColors` de `src/view/tokens.ts`.
  - Simplificar `ThemeProvider` e `useTheme()` para fornecer apenas `{ colors }` do tema claro, mantendo a sincronização de cor de fundo e `meta[name="theme-color"]` na Web.
  - Simplificar `categoryTone(category: string)` para usar exclusivamente `colors.categoryTones`.
- **Limpeza de ramificações nas Views:**
  - Remover `resolvedScheme` e estilos exclusivos de modo escuro em `src/view/components/Snackbar.tsx`, `src/view/home/CatalogCarousel.tsx`, `src/view/profile/ProfileHubSections.tsx`, `src/view/profile/settings.tsx`, `src/view/search/search.tsx`, `src/view/search/FilterSheet.tsx`, `src/view/listings/editListing.tsx` e `src/view/listings/createListingStep3.tsx`.
- **Remoção da infraestrutura de preferência de tema:**
  - Remover `src/model/entities/themePreference.ts`.
  - Remover `src/model/datasources/iThemePreferenceDataSource.ts`, `src/infra/datasources/memoryThemePreferenceDataSource.ts` e `src/infra/datasources/asyncStorageThemePreferenceDataSource.ts`.
  - Remover `src/usecase/iThemePreferenceUseCases.ts` e `src/usecase/themePreferenceUseCases.ts`.
  - Remover `src/viewmodel/useThemeViewModel.ts`.
  - Remover `themePreferenceUseCases` e `makeThemeViewModel` de `src/di/container.ts`.
- **Testes e documentação:**
  - Remover testes unitários de módulos excluídos (`tests/hooks/useThemeViewModel.test.tsx`, `tests/unit/themePreferenceUseCases.test.ts`, `tests/unit/asyncStorageThemePreferenceDataSource.test.ts`) e atualizar os testes de contraste, tokens, container e componentes.
  - Atualizar `docs/adr/0036-tema-escuro-entra-em-escopo.md`, `docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md`, `docs/adr/README.md`, `docs/design-system.md`, `docs/estado.md` e `README.md`.

## 3. Critérios de Aceite

- **CA01 (Tema claro exclusivo):** `useTheme()` retorna `{ colors }` com a paleta clara canônica e `app.json` define `"userInterfaceStyle": "light"`.
- **CA02 (Zero código morto de tema escuro):** `darkColors`, `ThemePreference`, `useThemeViewModel`, `ThemePreferenceUseCases` e `IThemePreferenceDataSource` não existem mais na árvore `src/`.
- **CA03 (Contraste WCAG AA no tema claro):** `tests/unit/themeContrast.test.ts` e `tests/unit/ipeColorsVitality.test.ts` validam todos os pares de cores do tema claro.
- **CA04 (Qualidade e validação):** `npm run validate` passa integralmente sem erros de tipagem, lint, arquitetura, design system, numeração, configuração de build, testes ou documentação.
