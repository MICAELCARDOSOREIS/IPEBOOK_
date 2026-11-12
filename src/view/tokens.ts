/**
 * IpêBook — Tokens de Design (IHC / UI)
 * Fonte canônica: design-system/tokens.json (ver ADR 0010). `colors` é o tema claro; `darkColors`
 * (mesma forma) é o tema escuro, habilitado pela ADR 0036 — ver `src/view/theme/ThemeProvider.tsx`
 * e `useTheme()` para o consumo dinâmico.
 *
 * Regra de Camada MVVM: Pertence estritamente à camada de View (UI).
 */

export const colors = {
  // Identidade e Marca
  // `background` e `surface` compartilham o mesmo tom (#FCFAF5) no tema claro, garantindo
  // conforto de leitura visual pólen e superfície editorial contínua (ADR 0056).
  background: "#FCFAF5",
  surface: "#FCFAF5",
  text: "#3C302A",
  secondaryText: "#645B55",
  action: "#2B6334",
  actionDeep: "#1E4E27",
  soft: "#EBF4EC",
  border: "#8F8478",
  highlight: "#F59E0B",
  gold: "#D97706",
  brandBrown: "#58331F",
  brandAmber: "#F59E0B",

  // Metáfora de Identidade: Livro, Ipê e Verde (Folhagem)
  book: {
    page: "#FCFAF5",         // Papel pólen para leitura confortável (sem ofuscamento)
    pageCard: "#F2EDE5",     // Superfície de cartões de livros e listas
    ink: "#3C302A",          // Tinta café/mineral com contraste AAA sobre a página
    inkSecondary: "#645B55", // Legendas e metadados de leitura
    leather: "#58331F",      // Marrom encadernação de capa e serifa da marca
    paperEdge: "#EADFC9",    // Linha suave de folheio e divisórias
  },

  nature: {
    foliage: "#2B6334",      // Verde botânico folha de ipê / botões de ação principal
    foliageDeep: "#1E4E27",  // Verde profundo para toques e botões pressionados
    sprout: "#EBF4EC",       // Verde broto suave para contêineres e tags
    onFoliage: "#FFFFFF",    // Texto e ícones sobre verde folhagem
  },

  // Ipê da marca (Spec 078, Spec 116): florada amarela solar radiante e harmoniosa
  ipe: {
    container: "#FEF3C7",    // Amarelo florada suave, solar e acolhedor (combina com o fundo pólen)
    onContainer: "#451A03",  // Marrom tronco profundo de alto contraste (AAA > 12:1)
    bloom: "#F5B718",        // Amarelo ouro solar radiante de ipê em plena florada
    bloomDeep: "#D97706",    // Âmbar dourado vivo (tubo e sépalas da flor)
    petalSoft: "#FFFBEB",    // Pétala solar fresca de ipê
    ribbon: "#F5B718",       // Fita marcadora dourada
    trunk: "#58331F",        // Tronco nobre
  },

  // Estados
  success: "#2B6334",
  error: "#B3261E",
  errorContainer: "#F9DEDC",
  disabledBackground: "#EBF4EC",
  disabledText: "#645B55",

  // Badges por Modalidade e Status (ADR 0104)
  badge: {
    sale: { background: "#1E4E27", text: "#FFFFFF" },
    trade: { background: "#58331F", text: "#FFFFFF" },
    donation: { background: "#F5B718", text: "#451A03" },
    reserved: { background: "#F5B718", text: "#451A03" },
    completed: { background: "#2B6334", text: "#FFFFFF" },
    paused: { background: "#52525B", text: "#FFFFFF" },
    available: { background: "#1E4E27", text: "#FFFFFF" },
  },

  // Tons pastel por categoria de livro (Spec 091) — mesmo par sempre para a mesma categoria.
  categoryTones: [
    { background: "#D6E4F0", text: "#14304A" }, // azul
    { background: "#E8DCF0", text: "#37214A" }, // lilás
    { background: "#F6D9DE", text: "#561F2B" }, // rosa
    { background: "#D4ECE8", text: "#15403A" }, // verde-água
    { background: "#EDE6C8", text: "#473E12" }, // oliva
    { background: "#F5DCC8", text: "#5A2F12" }, // pêssego
  ],

  // Capas ilustrativas (quando anúncio não tem imagem) — as 5 cores do catálogo de componentes
  // (capa-ilustrativa.md): Azul, Marrom, Verde, Vinho, Mostarda, além dos fundos das artes
  // artesanais (noite, árvore, montanhas, ondas), dourado da lombada e folha de papel do livro 3D.
  cover: {
    blue: "#253C4F",
    brown: "#7B4A2F",
    green: "#30574A",
    wine: "#6B2A36",
    ochre: "#86581A",
    sun: "#DDAF38",
    text: "#F5EFE8",
    gold: "#D9A93A",
    page: "#F1E9D6",
    artBackgrounds: ["#3A2A20", "#2C5232", "#14284B"],
  },

  // Papéis Material 3 (design-system/tokens.json, tema claro) — para componentes novos
  // (Button, TextField, Chip, Tag, Dialog etc.) das specs 003/004.
  m3: {
    primary: "#2b6334",
    onPrimary: "#ffffff",
    primaryContainer: "#d2ebd4",
    onPrimaryContainer: "#0a2d12",
    secondary: "#4b644f",
    onSecondary: "#ffffff",
    onSurface: "#1d1b18",
    onSurfaceVariant: "#4d4740",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f7f3ec",
    surfaceContainer: "#f2ede5",
    surfaceContainerHigh: "#ece6dd",
    surfaceContainerHighest: "#e6e0d7",
    outline: "#7e776f",
    outlineVariant: "#d3ccc2",
    secondaryContainer: "#dce9dc",
    onSecondaryContainer: "#132a17",
    tertiaryContainer: "#FDE68A",
    onTertiaryContainer: "#451A03",
    doacaoContainer: "#f4ddd3",
    onDoacaoContainer: "#6e3a28",
    errorContainerM3: "#f9dedc",
    onErrorContainer: "#410e0b",
    inverseSurface: "#322f2b",
    inverseOnSurface: "#f5efe8",
    focusRing: "#4e8a68",
    scrim: "#00000052",
    shadow: "#000000",
  },
} as const;

/** Mesma forma de `colors`, com folhas widened para `string` — permite que `colors` e `darkColors`
 * (valores hex diferentes) compartilhem um único tipo, consumido por `useTheme()`. */
type WidenToString<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenToString<U>[]
    : { [K in keyof T]: WidenToString<T[K]> };
export type ColorPalette = WidenToString<typeof colors>;

/**
 * Tema escuro (ADR 0036): mesma forma de `colors`, valores de `design-system/tokens.json` (coluna
 * `dark`) onde documentados. Tokens sem par `dark` explícito (ex. `success` como cor de texto)
 * reaproveitam o equivalente semântico mais próximo (`m3.primary` escuro) — verificado em
 * `tests/unit/themeContrast.test.ts`, nunca um valor inventado sem checagem de contraste.
 */
export const darkColors: ColorPalette = {
  // Identidade e Marca
  background: "#151311",
  surface: "#1d1b19",
  text: "#e8e2db",
  secondaryText: "#cdc5bc",
  action: "#98D6A2",
  actionDeep: "#B4E8BD",
  soft: "#27422C",
  border: "#968f86",
  highlight: "#F59E0B",
  gold: "#D97706",
  brandBrown: "#e2b48c",
  brandAmber: "#f59e0b",

  // Metáfora de Identidade: Livro, Ipê e Verde (Tema Escuro)
  book: {
    page: "#151311",         // Café noturno profundo
    pageCard: "#1D1B19",     // Cartão de leitura noturna
    ink: "#E8E2DB",          // Tinta clara suave com contraste AAA
    inkSecondary: "#CDC5BC", // Metadados secundários
    leather: "#E2B48C",      // Carvalho e lombada no modo escuro
    paperEdge: "#2C2A27",    // Linha de folheio escura
  },

  nature: {
    foliage: "#98D6A2",      // Verde broto/folha de ipê luminoso botânico
    foliageDeep: "#B4E8BD",  // Verde claro destacado
    sprout: "#27422C",       // Verde musgo escuro para contêineres
    onFoliage: "#053712",    // Texto escuro de alto contraste sobre verde folha
  },

  // Ipê da marca (Spec 078, Spec 116): florada no tema escuro com alto contraste e aconchego.
  ipe: {
    container: "#38290E",
    onContainer: "#FFE099",
    bloom: "#F59E0B",
    bloomDeep: "#D97706",
    petalSoft: "#281E0B",
    ribbon: "#F59E0B",
    trunk: "#e2b48c",
  },

  // Estados
  success: "#98D6A2",
  error: "#ffb4ab",
  errorContainer: "#8c1d18",
  disabledBackground: "#27422C",
  disabledText: "#cdc5bc",

  // Badges por Modalidade e Status (cores canônicas vibrantes unificadas nos dois temas)
  badge: {
    sale: { background: "#1E4E27", text: "#FFFFFF" },
    trade: { background: "#58331F", text: "#FFFFFF" },
    donation: { background: "#F5B718", text: "#451A03" },
    reserved: { background: "#F5B718", text: "#451A03" },
    completed: { background: "#2B6334", text: "#FFFFFF" },
    paused: { background: "#52525B", text: "#FFFFFF" },
    available: { background: "#1E4E27", text: "#FFFFFF" },
  },

  // Tons pastel por categoria de livro no tema escuro (Spec 091).
  categoryTones: [
    { background: "#2C4660", text: "#CFE3F5" },
    { background: "#48325E", text: "#EBD9F7" },
    { background: "#63303B", text: "#FAD9DF" },
    { background: "#27504A", text: "#CDEFE9" },
    { background: "#554C1E", text: "#F1E8C0" },
    { background: "#65402A", text: "#FADFCC" },
  ],

  // Capas ilustrativas: tons saturados, iguais nos dois temas (design-system/tokens.json).
  cover: {
    blue: "#253C4F",
    brown: "#7B4A2F",
    green: "#30574A",
    wine: "#6B2A36",
    ochre: "#86581A",
    sun: "#DDAF38",
    text: "#F5EFE8",
    gold: "#D9A93A",
    page: "#F1E9D6",
    artBackgrounds: ["#3A2A20", "#2C5232", "#14284B"],
  },

  // Papéis Material 3 (design-system/tokens.json, tema escuro).
  m3: {
    primary: "#98d6a2",
    onPrimary: "#053712",
    primaryContainer: "#184e21",
    onPrimaryContainer: "#b4e8bd",
    secondary: "#b2cbb5",
    onSecondary: "#1b361f",
    onSurface: "#e8e2db",
    onSurfaceVariant: "#cdc5bc",
    surfaceContainerLowest: "#0f0e0c",
    surfaceContainerLow: "#1d1b19",
    surfaceContainer: "#221f1d",
    surfaceContainerHigh: "#2c2a27",
    surfaceContainerHighest: "#373431",
    outline: "#968f86",
    outlineVariant: "#4b4640",
    secondaryContainer: "#324936",
    onSecondaryContainer: "#d0e7d3",
    tertiaryContainer: "#4D380A",
    onTertiaryContainer: "#FED766",
    doacaoContainer: "#5a2f22",
    onDoacaoContainer: "#ffdbcf",
    errorContainerM3: "#8c1d18",
    onErrorContainer: "#ffdad6",
    inverseSurface: "#e8e2db",
    inverseOnSurface: "#322f2b",
    focusRing: "#4e8a68",
    scrim: "#00000052",
    shadow: "#000000",
  },
} as const;

/**
 * Elevação Material 3 (design-system/tokens.json → shadow.tokens), tema claro. Duas sombras
 * sobrepostas por nível, formato CSS `box-shadow` (React Native Web); em RN nativo (Android),
 * usar junto com a prop `elevation` do Android quando o componente precisar de sombra nativa.
 */
export const elevation = {
  level0: "none",
  level1: "0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15)",
  level2: "0 1px 2px 0 rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15)",
  level3: "0 3px 8px 0 rgba(0,0,0,0.18)",
  level4: "0 2px 3px 0 rgba(0,0,0,0.30), 0 6px 10px 4px rgba(0,0,0,0.15)",
  level5: "0 4px 4px 0 rgba(0,0,0,0.30), 0 8px 12px 6px rgba(0,0,0,0.15)",
} as const;

export const spacing = {
  0: 0,
  2: 2,
  3: 3,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  /** Badges compactos de notificação/filtro Material 3 (18 dp). */
  18: 18,
  20: 20,
  24: 24,
  26: 26,
  28: 28,
  32: 32,
  /** Botão de ícone circular da barra superior e do topo da Home (40 dp). */
  40: 40,
  48: 48,
  56: 56,
  64: 64,
  /** Margem lateral na web larga (`WEB_GUTTER` e cabeçalho Web). */
  80: 80,
  /** Respiro amplo de rodapé com FAB ou painel de marca na web larga. */
  96: 96,
  /** Recuo superior da folha flutuante no mapa nativo. */
  150: 150,
} as const;

export const radius = {
  none: 0,
  /** Barra de arraste (handle) de folhas e indicador fino de progresso (2 dp). */
  hairline: 2,
  /** Lombada e face do livro 3D e pontos indicadores (3 dp). */
  micro: 3,
  /** Campo de texto contornado (M3: container de 4 dp). */
  extraSmall: 4,
  /** Ponto de notificação e bolinha central do botão de rádio (5 dp). */
  dot: 5,
  /** Canto de saída da bolha de mensagem no chat (6 dp). */
  bubbleCorner: 6,
  /** Segmento selecionado do controle segmentado (7 dp). */
  segmentInner: 7,
  small: 8,
  /** Trilho do controle segmentado e pílula de contagem (9 dp). */
  segmentOuter: 9,
  /** Anel externo do botão de rádio (10 dp). */
  radio: 10,
  /** Cartões pequenos, célula do iOS e miniaturas (design-system/tokens.json → `radius-md`: 12 dp). */
  cardSmall: 12,
  medium: 14,
  /** Cartões padrão e FAB (design-system/tokens.json → `radius-lg`: 16 dp). */
  card: 16,
  large: 18,
  /** Bolha de mensagem e cartões amplos da Web (`radius-xl`: 20 dp). */
  xl: 20,
  extraLarge: 24,
  /** Diálogo, folhas (BottomSheet) e seções da documentação (`radius-xxl`: 28 dp). */
  xxl: 28,
  /** Ícones circulares de estado vazio (64 dp -> 32 dp, 72 dp -> 36 dp, 80 dp -> 40 dp, 96 dp -> 48 dp). */
  circle64: 32,
  circle72: 36,
  circle80: 40,
  circle96: 48,
  full: 9999,
} as const;

export const accessibility = {
  /** Alvo de toque interativo mínimo: 48x48 dp (WCAG e Edital PDM/IHC) */
  touchTarget: 48,
  focusWidth: 2,
  focusOffset: 4,
} as const;

/**
 * Nomes das fontes carregadas por `useIpebookFonts` (ver `src/view/useIpebookFonts.ts`).
 * Source Serif 4 Bold é a marca (ADR 0007); Plus Jakarta Sans é a interface (ADR 0107)
 * com proporções humanistas, curvas acolhedoras e excelente legibilidade nos pesos 400/500/600.
 */
export const fontFamily = {
  brand: "SourceSerif4_700Bold",
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semiBold: "600" as const,
  bold: "700" as const,
} as const;

export const letterSpacing = {
  brandTighter: -0.5,
  brandTight: -0.48,
  brandSubtle: -0.3,
  taglineCompact: 0.4,
  publisher: 0.5,
  tagline: 0.6,
  overline: 0.8,
  code: 4,
} as const;

export const fontSize = {
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  19: 19,
  20: 20,
  22: 22,
  24: 24,
  26: 26,
  28: 28,
  30: 30,
  32: 32,
  34: 34,
  36: 36,
  38: 38,
  54: 54,
  56: 56,
  64: 64,
} as const;

export const lineHeight = {
  12: 12,
  13: 13,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  21: 21,
  22: 22,
  23: 23,
  24: 24,
  25: 25,
  26: 26,
  28: 28,
  29: 29,
  30: 30,
  32: 32,
  34: 34,
  36: 36,
  38: 38,
  40: 40,
  41: 41,
  42: 42,
  44: 44,
  46: 46,
  62: 62,
  64: 64,
} as const;

export const typography = {
  displayLarge: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  titleLarge: { fontSize: 24, lineHeight: 32, fontWeight: "600" as const, fontFamily: fontFamily.semiBold },
  titleMedium: { fontSize: 18, lineHeight: 26, fontWeight: "600" as const, fontFamily: fontFamily.semiBold },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  /** m3-label-lg: rótulo de botão preenchido e de chips de seleção. */
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  /** m3-label-sm: rótulo da barra de navegação, hora da mensagem e badges compactos. */
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  // Estilos tipográficos da Marca (design-system/tokens.json → Marca)
  brandHero: { fontSize: 56, lineHeight: 64, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandDisplayMd: { fontSize: 36, lineHeight: 41, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandLargeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandHeadline: { fontSize: 30, lineHeight: 36, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandSection: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandTitle: { fontSize: 24, lineHeight: 30, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  brandCardTitle: { fontSize: 19, lineHeight: 24, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  // Complementos Material 3 / iOS / Web (design-system/tokens.json)
  headlineMedium: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  titleBar: { fontSize: 22, lineHeight: 28, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  titleBlock: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const, fontFamily: fontFamily.semiBold },
  webLead: { fontSize: 19, lineHeight: 30, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  captionSmall: { fontSize: 11, lineHeight: 14, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  badgeMicro: { fontSize: 10, lineHeight: 12, fontWeight: "700" as const, fontFamily: fontFamily.semiBold },
  // Estilos de suporte específicos (ex: cards de compartilhamento e componentes especiais)
  brandDisplaySm: { fontSize: 26, lineHeight: 32, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  spineText: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  ratingStarInteractive: { fontSize: 36, lineHeight: 40, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  ratingStarStatic: { fontSize: 28, lineHeight: 32, fontWeight: "400" as const, fontFamily: fontFamily.regular },
} as const;

export const motion = {
  duration: {
    micro: 100,
    fast: 150,
    standard: 250,
    slow: 300,
    emphasized: 500,
  },
} as const;

/**
 * Física de molas do Material 3 Expressive (Spec 109 / ADR 0084):
 * - `spatialFast`: resposta imediata com leve elasticidade para botões, chips e ícones.
 * - `spatialStandard`: expansão fluida da pílula ativa na barra de navegação e cartões.
 * - `spatialSlow`: entrada expressiva de diálogos e folhas modais.
 * - `effectsFast`: transições rápidas de opacidade/cor sem oscilação excessiva.
 */
export const spring = {
  spatialFast: { tension: 320, friction: 20 },
  spatialStandard: { tension: 220, friction: 18 },
  spatialSlow: { tension: 160, friction: 18 },
  effectsFast: { tension: 380, friction: 28 },
} as const;

/**
 * Metamorfose de forma (Shape Morphing) do Material 3 Expressive (Spec 109 / ADR 0084):
 * elementos interativos alteram o raio dos cantos entre o estado de repouso, toque e seleção.
 */
export const shapeMorph = {
  buttonRest: radius.full,
  buttonPressed: radius.card,
  chipUnselected: radius.small,
  chipSelected: radius.card,
  cardRest: radius.card,
  cardPressed: radius.xl,
} as const;

export const tokens = {
  colors,
  spacing,
  radius,
  accessibility,
  fontFamily,
  fontWeight,
  letterSpacing,
  fontSize,
  lineHeight,
  typography,
  motion,
  spring,
  shapeMorph,
  elevation,
} as const;

export default tokens;
