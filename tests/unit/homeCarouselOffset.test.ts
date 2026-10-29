import { describe, expect, it } from "vitest";
import { carouselOffsetFor } from "@/view/home";

/**
 * Regressão: o deslocamento usava apenas a largura do card e ignorava a margem entre eles, o que
 * acumulava 12dp de desvio por clique nas setas Anterior/Próximo (medido no aparelho: 33px por
 * clique em densidade 3x). O passo correto é largura + margem.
 */
describe("deslocamento do carrossel da Home", () => {
  const ITEM_WIDTH = 152;
  const ITEM_GAP = 12;
  const STRIDE = ITEM_WIDTH + ITEM_GAP;

  it("mantém o primeiro item encostado na borda esquerda", () => {
    expect(carouselOffsetFor(0)).toBe(0);
  });

  it("conta a margem entre os cards a cada passo", () => {
    expect(carouselOffsetFor(1)).toBe(STRIDE);
    expect(carouselOffsetFor(1)).not.toBe(ITEM_WIDTH);
  });

  it("não acumula desvio ao longo do carrossel", () => {
    for (const index of [2, 3, 4, 7]) {
      expect(carouselOffsetFor(index)).toBe(index * STRIDE);
      // Desvio que o cálculo antigo produzia neste ponto.
      expect(carouselOffsetFor(index) - index * ITEM_WIDTH).toBe(index * ITEM_GAP);
    }
  });
});
