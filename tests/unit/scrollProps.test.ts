import {
  resolveVerticalKeyboardDismissMode,
  standardVerticalScrollProps,
  standardHorizontalScrollProps,
  scrollBottomPadding,
} from "@/view/scrollProps";

describe("scrollProps", () => {
  it("fornece propriedades padronizadas para rolagem vertical", () => {
    expect(standardVerticalScrollProps.keyboardDismissMode).toBe("on-drag");
    expect(standardVerticalScrollProps.keyboardShouldPersistTaps).toBe("handled");
    expect(standardVerticalScrollProps.showsVerticalScrollIndicator).toBe(false);
    expect(standardVerticalScrollProps.overScrollMode).toBe("never");
  });

  it("evita desfocar campos ao rolar na Web e mantém on-drag no mobile", () => {
    expect(resolveVerticalKeyboardDismissMode("web")).toBe("none");
    expect(resolveVerticalKeyboardDismissMode("android")).toBe("on-drag");
    expect(resolveVerticalKeyboardDismissMode("ios")).toBe("on-drag");
  });

  it("fornece propriedades padronizadas para rolagem horizontal", () => {
    expect(standardHorizontalScrollProps.keyboardShouldPersistTaps).toBe("handled");
    expect(standardHorizontalScrollProps.showsHorizontalScrollIndicator).toBe(false);
    expect(standardHorizontalScrollProps.overScrollMode).toBe("never");
  });

  it("define espaçamentos seguros de rodapé para telas com e sem barra inferior", () => {
    expect(scrollBottomPadding.withBottomBar).toBeGreaterThanOrEqual(80);
    expect(scrollBottomPadding.withoutBottomBar).toBeGreaterThanOrEqual(24);
  });
});
