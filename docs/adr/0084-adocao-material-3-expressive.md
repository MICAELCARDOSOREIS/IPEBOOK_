# 0084 — Adoção do Material 3 Expressive no Design System do IpêBook

- Data: 2026-10-30
- Status: aceito
- Especificação: [109](../../specs/109-m3-expressive/spec.md)
- Complementa: [0004](0004-design-system-e-tokens-ihc.md), [0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md), [0036](0036-tema-escuro-entra-em-escopo.md), [0056](0056-componentes-compartilhados-figma.md)

## Contexto
O IpêBook já utiliza tokens Material 3 (paletas clara e escura em `src/view/tokens.ts`, tipografia Source Serif 4 Bold + Roboto e componentes compartilhados em `src/view/components/`). O **Material 3 Expressive** (evolução oficial do M3 apresentada pelo Google para Android 16+) enfatiza:
1. **Física de molas (Spring Motion)** espacial e de efeitos em vez de curvas lineares/easing rígidas.
2. **Shape Morphing (metamorfose de forma)** ao tocar, selecionar ou expandir elementos interativos (botões, chips, pílulas da barra de navegação, FAB/ações primárias).
3. **Hierarquia tipográfica e cromática enfatizada** (títulos editoriais vibrantes, contêineres de destaque para ações comunitárias como troca/doação e cartões com agrupamento visual claro).
4. **Respeito estrito a `reduceMotion`**: animações espaciais de mola colapsam para transições instantâneas quando a pessoa ativa "reduzir movimento" no sistema.

## Decisão
Adotar os fundamentos do **Material 3 Expressive** na camada de `View` (`src/view/tokens.ts` e `src/view/components/`), preservando integralmente a arquitetura MVVM e a identidade editorial do IpêBook (verde Ipê, âmbar e Source Serif 4):
- **Tokens Expressivos (`tokens.spring` e `tokens.shapeMorph`)**: padronizar configurações de mola (`spatialFast`, `spatialStandard`, `spatialSlow`, `effectsFast`) e escalas de metamorfose de raio/escala em `src/view/tokens.ts`.
- **Hook utilitário `useExpressivePress`**: encapsular feedback tátil-visual de mola (escala e metamorfose de canto no estado pressionado/selecionado) respeitando `AccessibilityInfo.isReduceMotionEnabled()`.
- **Componentes base M3 Expressive**: evoluir `FilledButton`, `OutlinedButton`, `Chip`, `NavigationBar` (indicador ativo com física de mola espacial), `Dialog` / folhas modais e cartões de destaque sem quebrar contratos de props nem testes existentes.

## Alternativas consideradas
- **Usar bibliotecas externas de UI prontas (ex.: `react-native-paper`)**: descartado; substituiria a identidade visual própria do IpêBook e adicionaria peso desnecessário ao bundle.
- **Aplicar animações avulsas em cada tela**: descartado; concentrar nos tokens (`tokens.ts`) e nos componentes compartilhados (`src/view/components/`) garante consistência em todo o app Android e Web sem duplicar código.

## Consequências
- Interações mais vivas, responsivas e táteis no Android (Waydroid/dispositivos físicos) e na Web.
- Zero impacto nas camadas `model/`, `usecase/`, `infra/` e `viewmodel/` (estritamente restrito à camada `view/`).
- Total compatibilidade com os testes em Vitest / Testing Library e respeito a acessibilidade (`reduceMotion` e contraste WCAG AAA/AA).
