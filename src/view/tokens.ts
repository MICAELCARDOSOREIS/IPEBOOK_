/**
 * IpêBook — Tokens de Design (IHC / UI)
 * Fonte canônica: design-system/tokens.json (ver ADR 0010). `colors` é o tema claro; `darkColors`
 * (mesma forma) é o tema escuro, habilitado pela ADR 0036 — ver `src/view/theme/ThemeProvider.tsx`
 * e `useTheme()` para o consumo dinâmico. `design-tokens.json` na raiz foi substituído por este
 * arquivo e removido (ver Tarefa 26).
 *
 * Regra de Camada MVVM: Pertence estritamente à camada de View (UI).
 */

export const colors = {
  // Identidade e Marca
  // `background` e `surface` são o mesmo tom no Figma Android (`02.01` em diante): o fundo das
  // telas é `surface` (`#FCFAF5`), conforme design-system/tokens.json — ADR 0056.
  background: "#FCFAF5",
  surface: "#FCFAF5",
  text: "#3C302A",
  secondaryText: "#645B55",
  action: "#2C5E45",
  actionDeep: "#2F503D",
  soft: "#E7F0EA",
  border: "#8F8478",
  highlight: "#F4B942",
  gold: "#D99719",
  brandBrown: "#58331F",
  brandAmber: "#F2BC45",

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
    foliage: "#2C5E45",      // Verde botânico da copa do ipê / botões de ação principal
    foliageDeep: "#2F503D",  // Verde profundo para toques e botões pressionados
    sprout: "#E7F0EA",       // Verde broto suave para contêineres e tags
    onFoliage: "#FFFFFF",    // Texto e ícones sobre verde folhagem
  },

  // Ipê da marca (Spec 078): florada amarela, cartão de leitor e fita marcadora
  ipe: {
    container: "#FCEFCB",
    onContainer: "#4A2B16",
    bloom: "#F7C21E",
    bloomDeep: "#F29A1A",
    petalSoft: "#FEF6D8",
    ribbon: "#F7C21E",
    trunk: "#58331F",
  },

  // Estados
  success: "#2F6B4F",
  error: "#B3261E",
  errorContainer: "#F9DEDC",
  disabledBackground: "#E7F0EA",
  disabledText: "#645B55",

  // Badges por Modalidade
  badge: {
    sale: { background: "#DCE8DE", text: "#18291F" },
    trade: { background: "#F8D88A", text: "#3A2A10" },
    donation: { background: "#F4DDD3", text: "#6E3A28" },
    reserved: { background: "#F4B942", text: "#3C302A" },
    completed: { background: "#2F6B4F", text: "#FFFFFF" },
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
  // do Figma (capa-ilustrativa.md): Azul, Marrom, Verde, Vinho, Mostarda, além dos fundos das 4 artes
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
    primary: "#2c5e45",
    onPrimary: "#ffffff",
    primaryContainer: "#cfe9d7",
    onPrimaryContainer: "#0f2c1d",
    secondary: "#4d6356",
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
    secondaryContainer: "#dce8de",
    onSecondaryContainer: "#18291f",
    tertiaryContainer: "#f8d88a",
    onTertiaryContainer: "#3a2a10",
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
  action: "#9fd4b3",
  actionDeep: "#bbf0ce",
  soft: "#364b3e",
  border: "#968f86",
  highlight: "#F4B942",
  gold: "#D99719",
  brandBrown: "#e2b48c",
  brandAmber: "#f2bc45",

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
    foliage: "#9FD4B3",      // Verde menta luminoso botânico
    foliageDeep: "#BBF0CE",  // Verde claro destacado
    sprout: "#364B3E",       // Verde musgo escuro para contêineres
    onFoliage: "#00381F",    // Texto escuro de alto contraste sobre verde menta
  },

  // Ipê da marca (Spec 078): florada no tema escuro com alto contraste e aconchego.
  ipe: {
    container: "#38290E",
    onContainer: "#FFE099",
    bloom: "#F7C21E",
    bloomDeep: "#F29A1A",
    petalSoft: "#281E0B",
    ribbon: "#F7C21E",
    trunk: "#e2b48c",
  },

  // Estados
  success: "#9fd4b3",
  error: "#ffb4ab",
  errorContainer: "#8c1d18",
  disabledBackground: "#364b3e",
  disabledText: "#cdc5bc",

  // Badges por Modalidade (adaptados para leitura noturna suave sem ofuscamento)
  badge: {
    sale: { background: "#1F5139", text: "#BBF0CE" },
    trade: { background: "#4A3508", text: "#FFDF99" },
    donation: { background: "#5A2F22", text: "#FFDBCF" },
    reserved: { background: "#483200", text: "#FFE088" },
    completed: { background: "#1B4D36", text: "#D0F5DC" },
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
    primary: "#9fd4b3",
    onPrimary: "#00381f",
    primaryContainer: "#1f5139",
    onPrimaryContainer: "#bbf0ce",
    secondary: "#b4ccbc",
    onSecondary: "#203529",
    onSurface: "#e8e2db",
    onSurfaceVariant: "#cdc5bc",
    surfaceContainerLowest: "#0f0e0c",
    surfaceContainerLow: "#1d1b19",
    surfaceContainer: "#221f1d",
    surfaceContainerHigh: "#2c2a27",
    surfaceContainerHighest: "#373431",
    outline: "#968f86",
    outlineVariant: "#4b4640",
    secondaryContainer: "#364b3e",
    onSecondaryContainer: "#d2e8d9",
    tertiaryContainer: "#6b4f12",
    onTertiaryContainer: "#ffe2a8",
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
  /** Botão de ícone circular da barra superior e do topo da Home (Figma `01.06`, `02.01`). */
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
  /** Campo de texto contornado (M3: container de 4 dp), Figma `01.03`/`01.06`. */
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
 * Source Serif 4 Bold é a marca (ADR 0007); Roboto é a interface — ver a nota naquele arquivo
 * sobre por que é Roboto e não Roboto Flex.
 */
export const fontFamily = {
  brand: "SourceSerif4_700Bold",
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  semiBold: "Roboto_600SemiBold",
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
  /** m3-label-lg: rótulo de botão e de chip no Figma (`01.03`, `02.01`). */
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const, fontFamily: fontFamily.medium },
  /** m3-label-sm (02-tokens.md): rótulo da barra de navegação, hora da mensagem, badge. */
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
