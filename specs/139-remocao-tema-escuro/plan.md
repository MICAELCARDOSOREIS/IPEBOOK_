# Plano de Implementação — Spec 139 (Remoção do Tema Escuro)

## Arquitetura da Solução

1. **Simplificação da Camada de View (`src/view/`):**
   - `src/view/tokens.ts` exporta `colors` e `ColorPalette = WidenToString<typeof colors>` (ou `typeof colors`), removendo `darkColors`.
   - `src/view/theme/ThemeProvider.tsx` expõe `ThemeContextValue = { colors: ColorPalette }`, mantendo `ThemeProvider` e `useTheme()` para compatibilidade com todos os componentes que consomem `const { colors } = useTheme()`.
   - `src/view/categoryTone.ts` passa a receber apenas `category: string` (segundo argumento opcional ou removido) e indexar `colors.categoryTones`.
   - Componentes que liam `resolvedScheme` (`_layout.tsx`, `Snackbar.tsx`, `CatalogCarousel.tsx`, `ProfileHubSections.tsx`, `settings.tsx`, `search.tsx`, `FilterSheet.tsx`, `editListing.tsx`, `createListingStep3.tsx`) passam a usar diretamente os tokens claros.

2. **Remoção das Camadas de Preferência de Tema (`model`, `infra`, `usecase`, `viewmodel`, `di`):**
   - Exclusão de `themePreference.ts`, `iThemePreferenceDataSource.ts`, `memoryThemePreferenceDataSource.ts`, `asyncStorageThemePreferenceDataSource.ts`, `iThemePreferenceUseCases.ts`, `themePreferenceUseCases.ts` e `useThemeViewModel.ts`.
   - Limpeza das exportações `themePreferenceUseCases` e `makeThemeViewModel` em `src/di/container.ts`.

3. **Configuração e Testes:**
   - `app.json`: `"userInterfaceStyle": "light"`.
   - Atualização dos testes que importavam `darkColors`, `themePreferenceUseCases` ou `useThemeViewModel`, e remoção dos 3 arquivos de teste exclusivos da preferência de tema.
   - Sincronização de `docs/estado.md`, `README.md`, `docs/design-system.md` e `docs/adr/`.
