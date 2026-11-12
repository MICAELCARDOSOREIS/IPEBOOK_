import { describe, expect, it } from "vitest";
import { standardVerticalScrollProps, standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

describe("scrollProps", () => {
  it("fornece propriedades padronizadas para rolagem vertical", () => {
    expect(standardVerticalScrollProps.keyboardDismissMode).toBe("on-drag");
    expect(standardVerticalScrollProps.keyboardShouldPersistTaps).toBe("handled");
    expect(standardVerticalScrollProps.showsVerticalScrollIndicator).toBe(false);
    expect(standardVerticalScrollProps.overScrollMode).toBe("never");
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
