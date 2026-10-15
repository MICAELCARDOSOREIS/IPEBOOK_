/**
 * IpêBook — Tokens de Design (IHC / UI)
 * Fonte canônica: design-system/tokens.json (ver ADR 0008 e ADR 0010). Os valores abaixo são o
 * recorte de tema claro — dark mode não entra nesta etapa. `design-tokens.json` na raiz foi
 * substituído por este arquivo e removido (ver Tarefa 26).
 *
 * Regra de Camada MVVM: Pertence estritamente à camada de View (UI).
 */

export const colors = {
  // Identidade e Marca
  background: "#F6F1E8",
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

  // Capas ilustrativas (quando anúncio não tem imagem) — as 5 cores do catálogo de componentes
  // do Figma (capa-ilustrativa.md): Azul, Marrom, Verde, Vinho, Mostarda.
  cover: {
    blue: "#253C4F",
    brown: "#7B4A2F",
    green: "#30574A",
    wine: "#6B2A36",
    ochre: "#86581A",
    sun: "#DDAF38",
    text: "#F5EFE8",
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
  4: 4,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  48: 48,
  56: 56,
  64: 64,
} as const;

export const radius = {
  small: 8,
  medium: 14,
  large: 18,
  extraLarge: 24,
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

export const typography = {
  displayLarge: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const, fontFamily: fontFamily.brand },
  titleLarge: { fontSize: 24, lineHeight: 32, fontWeight: "600" as const, fontFamily: fontFamily.semiBold },
  titleMedium: { fontSize: 18, lineHeight: 26, fontWeight: "600" as const, fontFamily: fontFamily.semiBold },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const, fontFamily: fontFamily.regular },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const, fontFamily: fontFamily.medium },
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

export const tokens = {
  colors,
  spacing,
  radius,
  accessibility,
  typography,
  motion,
  elevation,
} as const;

export default tokens;
