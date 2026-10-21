import { describe, expect, it } from "vitest";
import { formatPrice } from "@/view/formatPrice";

describe("formatPrice", () => {
  it("usa vírgula decimal", () => {
    expect(formatPrice(25)).toBe("R$ 25,00");
    expect(formatPrice(9.5)).toBe("R$ 9,50");
  });

  it("separa o milhar com ponto", () => {
    expect(formatPrice(1250)).toBe("R$ 1.250,00");
    expect(formatPrice(1234567.891)).toBe("R$ 1.234.567,89");
  });

  it("mantém o zero e o sinal negativo", () => {
    expect(formatPrice(0)).toBe("R$ 0,00");
    expect(formatPrice(-3)).toBe("-R$ 3,00");
  });
});
