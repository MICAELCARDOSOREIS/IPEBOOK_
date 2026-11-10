import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors, darkColors } from "@/view/tokens";

const MIN_TEXT_CONTRAST = 4.5;

describe("contraste de tema claro/escuro (Spec 054 / Issue #144, WCAG AA)", () => {
  it.each([
    ["texto principal sobre fundo", colors.text, colors.background],
    ["texto secundário sobre fundo", colors.secondaryText, colors.background],
    ["texto principal sobre superfície", colors.text, colors.surface],
    ["ação sobre superfície", colors.action, colors.surface],
    ["erro sobre superfície", colors.error, colors.surface],
    ["sucesso sobre superfície", colors.success, colors.surface],
    ["on-primary sobre primary (M3)", colors.m3.onPrimary, colors.m3.primary],
    ["on-surface sobre surface (M3)", colors.m3.onSurface, colors.m3.surfaceContainerLow],
    ["on-surface-variant sobre surface (M3)", colors.m3.onSurfaceVariant, colors.m3.surfaceContainerLow],
    ["on-secondary-container sobre secondary-container (M3)", colors.m3.onSecondaryContainer, colors.m3.secondaryContainer],
    ["on-tertiary-container sobre tertiary-container (M3)", colors.m3.onTertiaryContainer, colors.m3.tertiaryContainer],
    ["on-doacao-container sobre doacao-container (M3)", colors.m3.onDoacaoContainer, colors.m3.doacaoContainer],
    ["on-error-container sobre error-container (M3)", colors.m3.onErrorContainer, colors.m3.errorContainerM3],
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
    ["on-surface-variant sobre surface (M3)", darkColors.m3.onSurfaceVariant, darkColors.m3.surfaceContainerLow],
    ["on-secondary-container sobre secondary-container (M3)", darkColors.m3.onSecondaryContainer, darkColors.m3.secondaryContainer],
    ["on-tertiary-container sobre tertiary-container (M3)", darkColors.m3.onTertiaryContainer, darkColors.m3.tertiaryContainer],
    ["on-doacao-container sobre doacao-container (M3)", darkColors.m3.onDoacaoContainer, darkColors.m3.doacaoContainer],
    ["on-error-container sobre error-container (M3)", darkColors.m3.onErrorContainer, darkColors.m3.errorContainerM3],
  ])("tema escuro: %s atinge 4.5:1", (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("badges mantêm contraste mínimo nos dois temas", () => {
    for (const theme of [colors, darkColors]) {
      for (const badge of Object.values(theme.badge)) {
        expect(contrastRatio(badge.text, badge.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
      // Badge de contagem sobre cor de erro (NavigationBar, ProfileHub, ProfileMenuSection)
      expect(contrastRatio(theme.surface, theme.error)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
    // No modo escuro, pontos/indicadores (dots) escolhem a cor de maior contraste (background ou text) sobre a superfície
    for (const badge of Object.values(darkColors.badge)) {
      const bestDotColor =
        contrastRatio(badge.background, darkColors.m3.surfaceContainerLowest) >=
        contrastRatio(badge.text, darkColors.m3.surfaceContainerLowest)
          ? badge.background
          : badge.text;
      expect(contrastRatio(bestDotColor, darkColors.m3.surfaceContainerLowest)).toBeGreaterThanOrEqual(3.0);
    }
  });

  it("tons de categoria mantêm contraste mínimo nos dois temas", () => {
    for (const theme of [colors, darkColors]) {
      for (const tone of theme.categoryTones) {
        expect(contrastRatio(tone.text, tone.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    }
  });

  it("tokens de identidade (Livro, Ipê e Folhagem/Verde) mantêm contraste mínimo nos dois temas", () => {
    // Modo claro
    expect(contrastRatio(colors.book.ink, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.book.inkSecondary, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.nature.foliage, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.nature.onFoliage, colors.nature.foliage)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.ipe.onContainer, colors.ipe.container)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);

    // Modo escuro
    expect(contrastRatio(darkColors.book.ink, darkColors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(darkColors.book.inkSecondary, darkColors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(darkColors.nature.foliage, darkColors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(darkColors.nature.onFoliage, darkColors.nature.foliage)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(darkColors.nature.onFoliage, darkColors.actionDeep)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(darkColors.ipe.onContainer, darkColors.ipe.container)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });
});
