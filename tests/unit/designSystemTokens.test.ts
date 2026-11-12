import { describe, expect, it } from "vitest";
import { colors, darkColors, tokens } from "@/view/tokens";

describe("Contrato dos tokens do Design System", () => {
  it("mantém os tokens essenciais sincronizados com os valores canônicos", () => {
    expect(colors.m3.primary).toBe("#2b6334");
    expect(colors.m3.secondaryContainer).toBe("#dce9dc");
    expect(colors.m3.onSecondaryContainer).toBe("#132a17");
    expect(colors.m3.focusRing).toBe("#4e8a68");
    expect(darkColors.m3.primary).toBe("#98d6a2");
  });

  it("expõe os grupos públicos necessários para as telas", () => {
    expect(tokens.spacing).toBeDefined();
    expect(tokens.radius).toBeDefined();
    expect(tokens.typography.brandCardTitle).toBeDefined();
    expect(tokens.accessibility.touchTarget).toBeGreaterThanOrEqual(44);
  });

  it("mantém aliases de superfície disponíveis nos dois temas", () => {
    expect(colors.m3.surfaceContainerHigh).toBeDefined();
    expect(colors.m3.surfaceContainerLow).toBeDefined();
    expect(darkColors.m3.surfaceContainerHigh).toBeDefined();
    expect(darkColors.m3.surfaceContainerLow).toBeDefined();
  });
});
