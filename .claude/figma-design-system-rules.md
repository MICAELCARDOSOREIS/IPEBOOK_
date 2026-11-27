# Regras de integração Figma ↔ código — IpêBook

> Gerado para orientar o uso do MCP do Figma (`get_design_context`, `get_screenshot`, Code
> Connect) ao implementar telas deste repositório. Não substitui `design-system/`, que é a
> fonte canônica de design — este arquivo só explica **onde** cada coisa vive no código e
> **como** mapear o que vem do Figma para os arquivos já existentes.

## 1. Tokens de design

- **Fonte canônica:** [`design-system/tokens.json`](../design-system/tokens.json) (machine-readable,
  ~50 tokens de cor, tipografia, espaço, forma, elevação e movimento).
- **Consumo em código:** [`src/view/tokens.ts`](../src/view/tokens.ts) — módulo TypeScript que
  espelha os temas claro (`colors`) e escuro (`darkColors`) para consumo dinâmico via `useTheme()`
  ([`src/view/theme/ThemeProvider.tsx`](../src/view/theme/ThemeProvider.tsx)). Único ponto de
  leitura de tokens na camada de View.
- **Formato:** objetos JS/TS simples (`colors`, `spacing`, `radius`, `accessibility`, …),
  exportados via `export const tokens = { colors, spacing, radius, accessibility, ... }`.
- **Regra obrigatória:** nenhum componente escreve cor, tamanho ou raio literal — sempre
  `tokens.colors.action`, `tokens.spacing[24]`, `tokens.radius.full`, etc. Ao trazer uma tela do
  Figma, qualquer valor numérico/hex deve ser resolvido para o token correspondente, nunca
  copiado como literal.
- Não há pipeline de transformação automática (Style Dictionary etc.): a sincronização
  `tokens.json` → `tokens.ts` é manual, revisada por quem mantém `design-system/`
  (ver seção 7 do `design-system/README.md`).

## 2. Biblioteca de componentes

- **Documentação/anatomia (fonte de verdade de design):**
  [`design-system/04-componentes/`](../design-system/04-componentes/) — 28 arquivos Markdown,
  um por componente ou padrão, cada um com anatomia, estados (padrão/pressionado/foco/desabilitado)
  e regras de acessibilidade.
- **Implementação React Native:** [`src/view/components/`](../src/view/components/) — componentes
  reutilizáveis de UI (como `AppIcon`, `FluentIcon`, `Avatar`, `BookCover`, `Chip`, `Dialog`,
  `FilledButton`, `OutlinedButton`, `TextButton`, `Logotipo`, `NavigationBar`, `ScreenContainer`,
  `SearchField`, `Snackbar`, `StepProgress`, `Tag`, `TextField`, `TopAppBar`, `WebHeader`, entre
  outros).
- **Arquitetura:** MVVM. `src/view/` é estritamente camada de apresentação (sem regra de
  negócio); lógica fica em `src/viewmodel/`, `src/usecase/`, `src/model/`. Um componente de
  Figma nunca deve receber lógica de domínio — só props e callbacks.
- **Convenção de componente:** função nomeada exportada (named export + default export),
  props tipadas em `type XProps`, estilos via `StyleSheet.create` no fim do arquivo,
  comentário de uma linha linkando ao `.md` correspondente em `design-system/04-componentes/`
  (ver `FilledButton.tsx` → comentário `/** Botão preenchido do design system (botao.md)... */`).
- Não há Storybook nem documentação visual interativa; a "doc viva" dos componentes é o par
  `04-componentes/<nome>.md` (design) + `src/view/components/<Nome>.tsx` (código).

## 3. Frameworks e bibliotecas

- **UI:** React 19.3 + React Native 0.88 via **Expo 58** (`expo-router` para navegação baseada em
  arquivo).
- **Web:** mesma base, renderizada com `react-native-web` — não há stack Web separada (ex.:
  Next.js); Android e Web compartilham os componentes de `src/view/components/`.
- **Tipografia:** `Source Serif 4 Bold` para marca e manchetes (ADR 0007) e `Plus Jakarta Sans`
  (400/500/600) para toda a interface (ADR 0107).
- **Estilo:** `StyleSheet.create` do React Native (sem styled-components, sem Tailwind, sem
  CSS Modules). Toda cor/espaço/raio vem de `tokens.ts` (ver seção 1).
- **Animação:** `react-native-reanimated` + `react-native-worklets` e `Animated` com respeito a
  `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled`.
- **Build/bundler:** Metro (padrão do Expo). `npm run build:web` → `expo export --platform web`.
- **Tipos:** TypeScript 6, `strict: true`, alias `@/*` → `src/*`.
- **Plataformas:** Android (Material Design 3) e Web (PWA responsivo, incluindo ajustes para Safari
  iOS na Spec 136 / ADR 0108) estão ativos; **iOS Nativo** (Liquid Glass / Apple HIG) está
  especificado em [`specs/137-ios-nativo-apple-hig/`](../specs/137-ios-nativo-apple-hig/spec.md) e
  deve permanecer isolado por `Platform.OS === "ios"` ou arquivos `.ios.tsx`.

## 4. Gestão de assets

- Imagens estáticas do app ficam em [`assets/`](../assets/) (ícone do app, splash, fontes
  carregadas via `@expo-google-fonts/*`).
- **Não há CDN nem pipeline de otimização de imagem configurado** — assets são estáticos e
  versionados no repositório.
- Capas de livro sem foto **não são asset de imagem**: são geradas pelo componente
  `BookCover.tsx` a partir de tokens de cor (`tokens.colors.cover`) + um motivo ilustrativo —
  ver `design-system/04-componentes/capa-ilustrativa.md`. Ao importar essa tela do Figma,
  nunca baixar o PNG da capa ilustrativa como asset; sempre usar o componente `BookCover`.
- Ao baixar assets reais do Figma (fotos de usuário, ícones custom que não existem no sistema
  de ícones), salvar em `assets/` seguindo a estrutura já existente, nunca inline/base64 no
  código.

## 5. Sistema de ícones

- Implementado em [`src/view/components/AppIcon.tsx`](../src/view/components/AppIcon.tsx) e
  [`FluentIcon.tsx`](../src/view/components/FluentIcon.tsx), usando `expo-symbols` (`SymbolView`)
  no iOS e ícones Material/Fluent no Android e na Web.
- **Mapa por plataforma, não arquivo SVG solto:** cada ícone é mapeado centralmente em `AppIcon.tsx`
  com resolução para iOS (SF Symbols), Android (Material Symbols) e Web (Fluent / Material, ver
  ADR 0014).
- **Convenção de nome:** chave em `camelCase` no mapa (`chevronRight`, `checkCircle`,
  `unarchive`...) descrevendo a função do ícone, não a forma visual.
- Ao trazer um ícone novo do Figma: não exportar o SVG do Figma como arquivo — adicionar uma
  nova entrada no mapa de `AppIcon.tsx` com os equivalentes por plataforma. Se não houver
  equivalente em uma das plataformas, registrar a lacuna em vez de inventar um nome.

## 6. Abordagem de estilização

- **Metodologia:** `StyleSheet.create` por componente (React Native nativo), sem metodologia
  CSS de web (não é BEM, não é CSS Modules, não é utility-first).
- **Estilos globais:** não há folha de estilo global de componentes; valores compartilhados vêm de
  `tokens.ts` e o tema é resolvido via `useTheme()` (`ThemeProvider`). Regras pontuais de CSS
  global do PWA/Web (como scrollbar, foco e safe-areas do Safari) ficam em `src/app/+html.tsx`.
- **Responsivo:** Android e Web compartilham os mesmos componentes RN; ajustes de layout para
  desktop/telas largas utilizam `useIsWideWeb()` / `useWindowDimensions()` dentro do componente.
- **Tema:** temas **claro e escuro** implementados com tokens semânticos em `tokens.ts` (`colors` e
  `darkColors`) e `ThemeProvider` (ADR 0036).

## 7. Estrutura do projeto

```
src/
  app/            # rotas (expo-router), uma pasta por fluxo (livro/, negociacao/, denunciar/)
  view/           # camada de apresentação (MVVM) — componentes e telas React Native
    components/   # componentes de UI reutilizáveis (ver seção 2)
    auth/, help/, legal/, listings/, notifications/, requests/, search/  # telas por domínio
    tokens.ts     # tokens consumidos pela UI (ver seção 1)
  viewmodel/      # estado e lógica de apresentação (MVVM) — sem import de UI
  usecase/        # regras de aplicação
  model/
    entities/     # entidades de domínio
    datasources/  # contratos de acesso a dados
    services/     # regras de domínio
    validators/   # validação de entidade/input
  infra/
    datasources/  # implementações concretas (Supabase etc.)
    services/     # integrações externas concretas
  di/             # injeção de dependência / composição

design-system/    # fonte canônica de design (markdown + tokens.json), fora de src/
docs/adr/         # decisões arquiteturais (consultar antes de mudanças estruturais)
specs/            # especificações por funcionalidade (Spec Kit)
tests/            # testes automatizados (Jest) e suíte E2E Web CDP (tests/e2e/)
```

- **Padrão de organização:** por camada MVVM primeiro (`view`/`viewmodel`/`usecase`/`model`/
  `infra`), e dentro de `view/` por domínio/fluxo (`auth`, `listings`, `search`, …).
- Regra verificada automaticamente: `npm run check:architecture`
  (`scripts/verificar-arquitetura.mjs`) — impede import cruzado indevido entre camadas. Rodar
  depois de qualquer tela nova trazida do Figma.

## 8. Checklist ao importar uma tela do Figma

1. Ler `design-system/01-principios.md`, `02-tokens.md`, `03-fundamentos.md` antes de montar a tela.
2. Para cada peça visual, achar o componente equivalente em `design-system/04-componentes/` e
   usar o `.tsx` já existente em `src/view/components/` — não recriar com markup bruto.
3. Resolver toda cor/espaço/raio para `tokens.ts` — nunca literal.
4. Resolver todo ícone para o mapa de `AppIcon.tsx` — nunca SVG solto.
5. Colocar a tela na pasta de domínio correta em `src/app/` e `src/view/<dominio>/`.
6. Rodar `npm run check:architecture` e os testes relevantes antes de considerar concluído.
7. Se a tela do Figma usar um componente, token ou ícone que não existe ainda no código,
   registrar a lacuna (não inventar valor) e seguir a seção 7 do `design-system/README.md`
   para propor a mudança.
