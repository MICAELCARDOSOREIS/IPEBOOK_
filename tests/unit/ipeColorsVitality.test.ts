import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors, darkColors } from "@/view/tokens";

describe("Spec 116 — Cores Vivas do Ipê e Harmonia de Contraste", () => {
  it("tokens de ipê amarelo possuem tons de florada solar viva (não cinzentos ou desbotados)", () => {
    // Ipê Amarelo vivo
    expect(colors.ipe.bloom).toBe("#F59E0B");
    expect(colors.ipe.bloomDeep).toBe("#D97706");
    expect(colors.ipe.container).toBe("#FEF3C7");
    expect(colors.ipe.petalSoft).toBe("#FFFBEB");
    expect(colors.ipe.onContainer).toBe("#451A03");

    // Contraste do texto sobre o container do ipê no tema claro atinge padrão AAA (>= 7:1)
    expect(contrastRatio(colors.ipe.onContainer, colors.ipe.container)).toBeGreaterThanOrEqual(7.0);
  });

  it("modalidade Trocas usa ouro de Ipê Amarelo vivo com contraste superior a 7:1", () => {
    expect(colors.m3.tertiaryContainer).toBe("#FDE68A");
    expect(colors.m3.onTertiaryContainer).toBe("#451A03");
    expect(contrastRatio(colors.m3.onTertiaryContainer, colors.m3.tertiaryContainer)).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(colors.badge.trade.text, colors.badge.trade.background)).toBeGreaterThanOrEqual(7.0);
  });

  it("modalidade Doações usa rosa florada de Ipê Rosa vivo com contraste superior a 7:1", () => {
    expect(colors.m3.doacaoContainer).toBe("#FCE7F3");
    expect(colors.m3.onDoacaoContainer).toBe("#831843");
    expect(contrastRatio(colors.m3.onDoacaoContainer, colors.m3.doacaoContainer)).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(colors.badge.donation.text, colors.badge.donation.background)).toBeGreaterThanOrEqual(7.0);
  });

  it("tema escuro mantém contraste elevado para as cores do ipê", () => {
    expect(contrastRatio(darkColors.ipe.onContainer, darkColors.ipe.container)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkColors.m3.onTertiaryContainer, darkColors.m3.tertiaryContainer)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkColors.m3.onDoacaoContainer, darkColors.m3.doacaoContainer)).toBeGreaterThanOrEqual(4.5);
  });
});
