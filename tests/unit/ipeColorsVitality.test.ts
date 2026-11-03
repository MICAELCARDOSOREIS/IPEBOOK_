import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors, darkColors } from "@/view/tokens";

describe("Spec 116 — Cores Vivas do Ipê e Harmonia de Contraste", () => {
  it("tokens de ipê amarelo possuem tons de florada solar viva (não cinzentos ou desbotados)", () => {
    // Ipê Amarelo vivo
    expect(colors.ipe.bloom).toBe("#FACC15");
    expect(colors.ipe.bloomDeep).toBe("#EAB308");
    expect(colors.ipe.container).toBe("#FEF08A");
    expect(colors.ipe.petalSoft).toBe("#FEF9C3");
    expect(colors.ipe.onContainer).toBe("#451A03");

    // Contraste do texto sobre o container do ipê no tema claro atinge padrão AAA (>= 7:1)
    expect(contrastRatio(colors.ipe.onContainer, colors.ipe.container)).toBeGreaterThanOrEqual(7.0);
  });

  it("tokens de verde folha de ipê possuem tom botânico vivo e acolhedor (WCAG AA e AAA)", () => {
    // Verde Folha de Ipê natural
    expect(colors.action).toBe("#2B6334");
    expect(colors.nature.foliage).toBe("#2B6334");
    expect(colors.m3.primary).toBe("#2b6334");
    expect(colors.m3.onPrimary).toBe("#ffffff");

    // Contraste sobre superfície e sobre primary
    expect(contrastRatio(colors.action, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.m3.onPrimary, colors.m3.primary)).toBeGreaterThanOrEqual(7.0);

    // Contêineres de broto suave e modalidade Venda
    expect(contrastRatio(colors.m3.onPrimaryContainer, colors.m3.primaryContainer)).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(colors.m3.onSecondaryContainer, colors.m3.secondaryContainer)).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(colors.badge.sale.text, colors.badge.sale.background)).toBeGreaterThanOrEqual(7.0);
  });

  it("modalidade Trocas usa ouro de Ipê Amarelo vivo com contraste superior a 7:1", () => {
    expect(colors.m3.tertiaryContainer).toBe("#FDE68A");
    expect(colors.m3.onTertiaryContainer).toBe("#451A03");
    expect(contrastRatio(colors.m3.onTertiaryContainer, colors.m3.tertiaryContainer)).toBeGreaterThanOrEqual(7.0);
    expect(contrastRatio(colors.badge.trade.text, colors.badge.trade.background)).toBeGreaterThanOrEqual(7.0);
  });

  it("modalidade Doações preserva o tom canônico terracota/pêssego do design system com contraste WCAG AA", () => {
    expect(colors.m3.doacaoContainer.toLowerCase()).toBe("#f4ddd3");
    expect(colors.m3.onDoacaoContainer.toLowerCase()).toBe("#6e3a28");
    expect(contrastRatio(colors.m3.onDoacaoContainer, colors.m3.doacaoContainer)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.badge.donation.text, colors.badge.donation.background)).toBeGreaterThanOrEqual(4.5);
  });

  it("tema escuro mantém contraste elevado para as cores do ipê", () => {
    expect(contrastRatio(darkColors.ipe.onContainer, darkColors.ipe.container)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkColors.m3.onTertiaryContainer, darkColors.m3.tertiaryContainer)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkColors.m3.onDoacaoContainer, darkColors.m3.doacaoContainer)).toBeGreaterThanOrEqual(4.5);
  });
});
