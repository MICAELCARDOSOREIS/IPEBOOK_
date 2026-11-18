import { colors } from "@/view/tokens";

/**
 * Cor própria de cada categoria: a mesma categoria tem sempre a mesma cor em todas as telas.
 * Tons pastel (fundo + texto) definidos em `src/view/tokens.ts` (`categoryTones`).
 */
export type Tone = { background: string; text: string };

export function categoryTone(category: string): Tone {
  const key = category.trim().toLocaleLowerCase("pt-BR");
  const hash = [...key].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const palette = colors.categoryTones;
  return palette[hash % palette.length];
}
