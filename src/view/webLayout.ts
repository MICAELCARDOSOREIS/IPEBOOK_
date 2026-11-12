import { useWindowDimensions } from "react-native";

/** Largura máxima do conteúdo na web larga: acompanha o cabeçalho do site e cresce com a janela. */
export const WEB_MAX_WIDTH = 1760;
/** Margem lateral do conteúdo na web larga (a mesma do `WebHeader` e Boas-Vindas). */
export const WEB_GUTTER = 64;
/** A partir daqui as listas e grades ganham uma coluna a mais. */
export const WEB_EXTRA_COLUMN_WIDTH = 1500;

/** Largura útil do conteúdo da web larga para uma janela de `windowWidth` px. */
export function webContentWidth(windowWidth: number): number {
  return Math.min(windowWidth, WEB_MAX_WIDTH) - WEB_GUTTER * 2;
}

/** Quantas colunas cabem: `base` em janelas normais, `base + 1` nas largas, nunca acima de `max`. */
export function webColumnCount(windowWidth: number, base: number, max: number = base + 1): number {
  return Math.min(max, windowWidth >= WEB_EXTRA_COLUMN_WIDTH ? base + 1 : base);
}

/**
 * Largura percentual de cada item numa grade com `columns` colunas. Reserva 3% por vão, o que
 * cobre vãos de até 24 px já na menor largura larga (960 px), para as colunas nunca quebrarem.
 */
export function webColumnWidth(columns: number): `${number}%` {
  return `${Math.floor(((100 - (columns - 1) * 3) / columns) * 10) / 10}%`;
}

/** Colunas da grade de livros: 3 em notebooks pequenos, 4 no desktop padrão e 5 em telas grandes. */
export function webGridColumns(windowWidth: number): number {
  if (windowWidth < 1280) return 3;
  if (windowWidth < WEB_EXTRA_COLUMN_WIDTH) return 4;
  return 5;
}

/** Colunas atuais da grade de livros (ver `webGridColumns`). */
export function useWebGridColumns(): number {
  const { width } = useWindowDimensions();
  return webGridColumns(width);
}

/** Colunas atuais da grade (ver `webColumnCount`). */
export function useWebColumns(base: number, max?: number): number {
  const { width } = useWindowDimensions();
  return webColumnCount(width, base, max);
}
