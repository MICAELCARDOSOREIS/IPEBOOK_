/**
 * Preço no formato brasileiro (`R$ 1.250,00`), como o Figma escreve em `02.06`, `04.08` e `05.01`.
 * Formatação manual para não depender do suporte a `Intl` de cada motor JavaScript.
 */
export function formatPrice(value: number): string {
  const [integer, cents] = Math.abs(value).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 ? "-" : ""}R$ ${grouped},${cents}`;
}
