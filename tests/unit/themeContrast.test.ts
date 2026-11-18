import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors } from "@/view/tokens";

const MIN_TEXT_CONTRAST = 4.5;

describe("contraste do tema claro (WCAG AA)", () => {
  it.each([
    ["texto principal sobre fundo", colors.text, colors.background],
    ["texto secundário sobre fundo", colors.secondaryText, colors.background],
    ["texto principal sobre superfície", colors.text, colors.surface],
    ["ação sobre superfície", colors.action, colors.surface],
    ["erro sobre superfície", colors.error, colors.surface],
    ["sucesso sobre superfície", colors.success, colors.surface],
    ["on-primary sobre primary (M3)", colors.m3.onPrimary, colors.m3.primary],
    ["on-primary-container sobre primary-container (M3)", colors.m3.onPrimaryContainer, colors.m3.primaryContainer],
    ["on-surface sobre surface (M3)", colors.m3.onSurface, colors.m3.surfaceContainerLow],
    ["texto principal sobre surface-container-high (M3)", colors.text, colors.m3.surfaceContainerHigh],
    ["texto secundário sobre surface-container-high (M3)", colors.secondaryText, colors.m3.surfaceContainerHigh],
    ["on-surface-variant sobre surface (M3)", colors.m3.onSurfaceVariant, colors.m3.surfaceContainerLow],
    ["on-secondary-container sobre secondary-container (M3)", colors.m3.onSecondaryContainer, colors.m3.secondaryContainer],
    ["on-tertiary-container sobre tertiary-container (M3)", colors.m3.onTertiaryContainer, colors.m3.tertiaryContainer],
    ["on-doacao-container sobre doacao-container (M3)", colors.m3.onDoacaoContainer, colors.m3.doacaoContainer],
    ["on-error-container sobre error-container (M3)", colors.m3.onErrorContainer, colors.m3.errorContainerM3],
  ])("tema claro: %s atinge 4.5:1", (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("badges mantêm contraste mínimo no tema claro", () => {
    for (const badge of Object.values(colors.badge)) {
      expect(contrastRatio(badge.text, badge.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
    // Badge de contagem sobre cor de erro (NavigationBar, ProfileHub, ProfileMenuSection)
    expect(contrastRatio(colors.surface, colors.error)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("tons de categoria mantêm contraste mínimo no tema claro", () => {
    for (const tone of colors.categoryTones) {
      expect(contrastRatio(tone.text, tone.background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    }
  });

  it("tokens de identidade (Livro, Ipê e Folhagem/Verde) mantêm contraste mínimo no tema claro", () => {
    expect(contrastRatio(colors.book.ink, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.book.inkSecondary, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.nature.foliage, colors.book.page)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.nature.onFoliage, colors.nature.foliage)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(colors.ipe.onContainer, colors.ipe.container)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });
});
