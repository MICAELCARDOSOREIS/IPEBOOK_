import * as tokensModule from "@/view/tokens";
import { colors, tokens } from "@/view/tokens";

describe("Contrato dos tokens do Design System", () => {
  it("mantém os tokens essenciais sincronizados com os valores canônicos do tema claro", () => {
    expect(colors.m3.primary).toBe("#2b6334");
    expect(colors.m3.secondaryContainer).toBe("#dce9dc");
    expect(colors.m3.onSecondaryContainer).toBe("#132a17");
    expect(colors.m3.focusRing).toBe("#4e8a68");
    expect("darkColors" in tokensModule).toBe(false);
  });

  it("expõe os grupos públicos necessários para as telas", () => {
    expect(tokens.spacing).toBeDefined();
    expect(tokens.radius).toBeDefined();
    expect(tokens.typography.brandCardTitle).toBeDefined();
    expect(tokens.accessibility.touchTarget).toBeGreaterThanOrEqual(44);
  });

  it("mantém aliases de superfície disponíveis no tema claro", () => {
    expect(colors.m3.surfaceContainerHigh).toBeDefined();
    expect(colors.m3.surfaceContainerLow).toBeDefined();
  });
});
