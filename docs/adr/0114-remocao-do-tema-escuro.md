# 0114. Remoção do tema escuro: operação exclusiva em tema claro editorial

- **Status:** Aceito
- **Data:** 2026-11-18
- **Contexto:** UX / Design System / Tokens / Spec 139
- **Decisores:** Equipe IpêBook
- **Substitui:** [0036 — Tema escuro entra em escopo](0036-tema-escuro-entra-em-escopo.md)

## Contexto

O [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md) estabeleceu na fundação do projeto que o aplicativo operaria apenas no tema claro editorial (papel pólen `#FCFAF5`, tinta café `#3C302A`, verde folhagem `#2B6334` e florada de ipê `#F5B718`). Posteriormente, o [ADR 0036](0036-tema-escuro-entra-em-escopo.md) (Spec 054, Spec 055 e Spec 073) introduziu o suporte a tema escuro (`darkColors`), detecção de esquema do sistema operacional (`useColorScheme`) e persistência local de preferência (`ThemePreference`, `IThemePreferenceDataSource`, `ThemePreferenceUseCases` e `useThemeViewModel`).

Na evolução recente da interface, os seletores manuais de aparência já haviam sido retirados das telas, mas a infraestrutura de alternância automática pelo sistema (`"userInterfaceStyle": "automatic"` no `app.json` e `useColorScheme()` no `useThemeViewModel`) continuava ativa. Por decisão de produto, o IpêBook não terá tema escuro: a identidade editorial em papel pólen claro é única em todas as plataformas (Android, iOS e Web).

## Decisão

1. **O aplicativo opera exclusivamente no tema claro editorial.** O ADR 0036 fica substituído por esta decisão, restabelecendo a decisão 1 do ADR 0008 em caráter definitivo.
2. **Remoção da paleta escura e da camada de preferência de tema.** Saem do código `darkColors` (`src/view/tokens.ts`), a entidade `ThemePreference` (`src/model/entities/themePreference.ts`), a porta `IThemePreferenceDataSource` e suas implementações em memória e `AsyncStorage`, o caso de uso `ThemePreferenceUseCases` (`IThemePreferenceUseCases`), o `useThemeViewModel` e os registros correspondentes no container de injeção de dependências (`src/di/container.ts`).
3. **Simplificação de `ThemeProvider` e `useTheme()`.** O hook `useTheme()` e o componente `ThemeProvider` permanecem como fachada leve da camada de View retornando `{ colors }` da paleta clara canônica, evitando refatoração desnecessária nos componentes que já consomem `const { colors } = useTheme()`, mas sem estado assíncrono, sem leitura de `useColorScheme` e sem ramificações `resolvedScheme === "dark"`.
4. **Trava de plataforma em modo claro.** `app.json` passa a declarar `"userInterfaceStyle": "light"` e a `StatusBar` em `src/app/_layout.tsx` usa estilo `"dark"` fixo (ícones escuros sobre fundo claro `#FCFAF5`).

## Consequências

- Elimina-se código morto e complexidade de manutenção de duas paletas paralelas em tokens, componentes (`Snackbar`, `CatalogCarousel`, `ProfileHubSections`, `Settings`, `categoryTone`) e testes.
- Dispositivos com sistema operacional em modo escuro exibem sempre a superfície clara editorial do IpêBook, sem inversão involuntária de cores nem flashes na inicialização.
- As Specs 054 e 055 e a parte de seleção de tema da Spec 073 ficam revogadas no histórico; `design-system/tokens.json` preserva seus dados históricos sem efeito de runtime para tema escuro.
