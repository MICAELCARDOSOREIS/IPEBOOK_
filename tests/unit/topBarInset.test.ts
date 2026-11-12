import { describe, expect, it } from "vitest";
import { topBarInset } from "@/view/topBarInset";

describe("topBarInset", () => {
  it("mantém o recuo padrão em celular e tablet estreito", () => {
    expect(topBarInset(390)).toBe(8);
    expect(topBarInset(720)).toBe(8);
  });

  it("alinha à coluna de conteúdo em janelas largas", () => {
    // (1440 - 720) / 2 = 360 de margem + 24 de respiro - 8 de folga do botão
    expect(topBarInset(1440)).toBe(376);
  });

  it("acompanha a largura de conteúdo informada pela tela", () => {
    // (1440 - 1100) / 2 = 170 + 24 - 8
    expect(topBarInset(1440, 1100)).toBe(186);
    expect(topBarInset(1000, 1100)).toBe(8);
  });
});
