/** Largura máxima do conteúdo centralizado das telas (as telas usam 720 com 24 de respiro). */
const CONTENT_MAX_WIDTH = 720;
const CONTENT_PADDING = 24;
/** O ícone de 24 dentro do botão de 40 já deixa 8 de folga. */
const BACK_BUTTON_GUTTER = 8;
const DEFAULT_INSET = 8;

/**
 * Recuo horizontal da barra superior: em janelas largas alinha a seta de voltar e o título à
 * coluna de conteúdo centralizada, em vez de colar na borda da janela.
 */
export function topBarInset(windowWidth: number): number {
  if (windowWidth <= CONTENT_MAX_WIDTH) return DEFAULT_INSET;
  return Math.round((windowWidth - CONTENT_MAX_WIDTH) / 2) + CONTENT_PADDING - BACK_BUTTON_GUTTER;
}
