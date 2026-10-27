/**
 * Cor própria de cada categoria: a mesma categoria tem sempre a mesma cor em todas as telas.
 * Tons pastel (fundo + texto) próximos dos das modalidades, com versões para o tema escuro.
 */
export type Tone = { background: string; text: string };

const LIGHT: readonly Tone[] = [
  { background: "#D6E4F0", text: "#14304A" }, // azul
  { background: "#E8DCF0", text: "#37214A" }, // lilás
  { background: "#F6D9DE", text: "#561F2B" }, // rosa
  { background: "#D4ECE8", text: "#15403A" }, // verde-água
  { background: "#EDE6C8", text: "#473E12" }, // oliva
  { background: "#F5DCC8", text: "#5A2F12" }, // pêssego
];

const DARK: readonly Tone[] = [
  { background: "#2C4660", text: "#CFE3F5" },
  { background: "#48325E", text: "#EBD9F7" },
  { background: "#63303B", text: "#FAD9DF" },
  { background: "#27504A", text: "#CDEFE9" },
  { background: "#554C1E", text: "#F1E8C0" },
  { background: "#65402A", text: "#FADFCC" },
];

export function categoryTone(category: string, scheme: "light" | "dark"): Tone {
  const key = category.trim().toLocaleLowerCase("pt-BR");
  const hash = [...key].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const palette = scheme === "dark" ? DARK : LIGHT;
  return palette[hash % palette.length];
}
