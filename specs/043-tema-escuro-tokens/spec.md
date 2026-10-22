# Spec 043 — Tema escuro: infraestrutura e primeira fatia vertical (Issue #144)

## Contexto

Figma fluxo 12 · Acessibilidade e temas (`12.01 · Tema escuro`, `12.02 · Alto contraste`). Ver
[ADR 0035](../../docs/adr/0035-tema-escuro-entra-em-escopo.md) para a decisão de reverter a ADR
0008 e trazer o tema escuro para o escopo.

## Escopo desta entrega

A superfície completa é grande (49 arquivos de view consomem `tokens.colors` hoje). Esta entrega
cobre:

1. **Infraestrutura completa, reutilizável por qualquer tela futura:**
   - `src/model/entities/themePreference.ts` — tipo `ThemePreference` ("system"/"light"/"dark").
   - `src/model/datasources/iThemePreferenceDataSource.ts` + implementações
     (`MemoryThemePreferenceDataSource`, `AsyncStorageThemePreferenceDataSource`).
   - `src/usecase/themePreferenceUseCases.ts` — persiste a escolha, à prova de falha de leitura/escrita.
   - `src/viewmodel/useThemeViewModel.ts` — resolve `system`/`light`/`dark` combinando
     `useColorScheme()` (tema do aparelho) com a preferência salva.
   - `src/view/theme/ThemeProvider.tsx` + `useTheme()` — distribui as cores resolvidas via Context;
     envolvido em `src/app/_layout.tsx`. Fora do Provider, cai no tema claro (nunca quebra).
   - `src/view/tokens.ts` ganha `darkColors` (mesma forma de `colors`), com os valores do
     `design-system/tokens.json` (coluna `dark`), e `src/view/theme/contrastRatio.ts` + teste
     (`tests/unit/themeContrast.test.ts`) garantindo 4.5:1 nos pares usados.
2. **Fatia vertical completa e verificável:** a Home (`src/view/home.tsx`) e os componentes do
   Design System que ela usa diretamente — `BookCover`, `ErrorState`, `FavoriteButton`,
   `LoadingState`, `OfflineState` — mais a `NavigationBar` (chrome global, visível junto da Home) —
   migrados de `StyleSheet.create` estático para `createStyles(colors)` lido via `useTheme()`.
3. **Alternância manual visível e testável:** grupo de três opções (Sistema/Claro/Escuro) na
   própria Home (`testID="theme-toggle-radiogroup"`), persistida via `themePreferenceUseCases`.

## Fora do escopo (acompanhamento)

As ~47 telas e os ~22 componentes de Design System restantes continuam no tema claro fixo
(`tokens.colors` direto) até serem migrados nas issues de acompanhamento — mesmo padrão incremental
já usado nas Issues #142/#185.

## Critérios de aceite

- [x] Contraste mínimo de 4.5:1 para textos em ambos os modos, nos pares efetivamente usados
      (`tests/unit/themeContrast.test.ts`).
- [x] Cores semânticas da marca preservadas — `#2C5E45` (ação), não `#0D47A1` (esse era o
      `theme_color` do PWA, já corrigido antes desta entrega — ver `docs/estado.md:150`).
- [x] Testes cobrindo a alternância de tokens (viewmodel, provider, componente) e a preservação de
      contraste.
- [x] `npm run validate` passando.
