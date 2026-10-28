/** Largura padrão do conteúdo centralizado das telas (720 com 24 de respiro). */
export const CONTENT_MAX_WIDTH = 720;
const CONTENT_PADDING = 24;
/** O ícone de 24 dentro do botão de 40 já deixa 8 de folga. */
const BACK_BUTTON_GUTTER = 8;
const DEFAULT_INSET = 8;

/**
 * Recuo horizontal da barra superior: em janelas largas alinha a seta de voltar e o título à
 * coluna de conteúdo centralizada, em vez de colar na borda da janela.
 */
export function topBarInset(windowWidth: number, contentMaxWidth: number = CONTENT_MAX_WIDTH): number {
  if (windowWidth <= contentMaxWidth) return DEFAULT_INSET;
  return Math.round((windowWidth - contentMaxWidth) / 2) + CONTENT_PADDING - BACK_BUTTON_GUTTER;
}
