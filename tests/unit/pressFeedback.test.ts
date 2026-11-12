import { describe, expect, it } from "vitest";
import { expressivePressedStyle, withPress } from "@/view/pressFeedback";

describe("withPress — resposta de toque M3 Expressive (Spec 109, ADR 0084)", () => {
  it("mantém o estilo original quando não há toque", () => {
    const base = { padding: 8 };
    expect(withPress(base)({ pressed: false, hovered: false } as never)).toBe(base);
  });

  it("acrescenta compressão e atenuação enquanto pressionado", () => {
    const base = { padding: 8 };
    expect(withPress(base)({ pressed: true, hovered: false } as never)).toEqual([base, expressivePressedStyle]);
    expect(expressivePressedStyle.transform).toEqual([{ scale: 0.97 }]);
    expect(expressivePressedStyle.opacity).toBeGreaterThan(0.8);
  });
});
