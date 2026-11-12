import { colors, darkColors } from "@/view/tokens";

/**
 * Cor própria de cada categoria: a mesma categoria tem sempre a mesma cor em todas as telas.
 * Tons pastel (fundo + texto) próximos dos das modalidades, com versões para o tema escuro
 * definidas em `src/view/tokens.ts` (`categoryTones`).
 */
export type Tone = { background: string; text: string };

export function categoryTone(category: string, scheme: "light" | "dark"): Tone {
  const key = category.trim().toLocaleLowerCase("pt-BR");
  const hash = [...key].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const palette = scheme === "dark" ? darkColors.categoryTones : colors.categoryTones;
  return palette[hash % palette.length];
}
