import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors, darkColors } from "@/view/tokens";

const MIN_TEXT_CONTRAST = 4.5;

describe("contraste de tema claro/escuro (Spec 043 / Issue #144, WCAG AA)", () => {
  it.each([
    ["texto principal sobre fundo", colors.text, colors.background],
    ["texto secundário sobre fundo", colors.secondaryText, colors.background],
    ["texto principal sobre superfície", colors.text, colors.surface],
    ["ação sobre superfície", colors.action, colors.surface],
    ["erro sobre superfície", colors.error, colors.surface],
    ["sucesso sobre superfície", colors.success, colors.surface],
    ["on-primary sobre primary (M3)", colors.m3.onPrimary, colors.m3.primary],
    ["on-surface sobre surface (M3)", colors.m3.onSurface, colors.m3.surfaceContainerLow],
  ])("tema claro: %s atinge 4.5:1", (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each([
    ["texto principal sobre fundo", darkColors.text, darkColors.background],
    ["texto secundário sobre fundo", darkColors.secondaryText, darkColors.background],
    ["texto principal sobre superfície", darkColors.text, darkColors.surface],
    ["ação sobre superfície", darkColors.action, darkColors.surface],
    ["erro sobre superfície", darkColors.error, darkColors.surface],
    ["sucesso sobre superfície", darkColors.success, darkColors.surface],
    ["on-primary sobre primary (M3)", darkColors.m3.onPrimary, darkColors.m3.primary],
    ["on-surface sobre surface (M3)", darkColors.m3.onSurface, darkColors.m3.surfaceContainerLow],
  ])("tema escuro: %s atinge 4.5:1", (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("badges mantêm contraste mínimo nos dois temas", () => {
    for (const theme of [colors, darkColors]) {
      for (const badge of Object.values(theme.badge)) {
        expect(contrastRatio(badge.text, badge.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    }
  });
});
