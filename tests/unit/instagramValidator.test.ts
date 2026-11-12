import { describe, expect, it } from "vitest";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";

describe("normalizeInstagramHandle (regra única do @perfil)", () => {
  it("aceita e normaliza o padrão oficial do Instagram", () => {
    expect(normalizeInstagramHandle("@anapaula")).toBe("@anapaula");
    expect(normalizeInstagramHandle(" anapaula ")).toBe("@anapaula");
    expect(normalizeInstagramHandle("@@anapaula")).toBe("@anapaula");
    expect(normalizeInstagramHandle("a.b_c9")).toBe("@a.b_c9");
    expect(normalizeInstagramHandle("a".repeat(30))).toBe(`@${"a".repeat(30)}`);
  });

  it("retorna null para vazio, nulo ou indefinido", () => {
    expect(normalizeInstagramHandle("")).toBeNull();
    expect(normalizeInstagramHandle("   ")).toBeNull();
    expect(normalizeInstagramHandle("@")).toBeNull();
    expect(normalizeInstagramHandle(null)).toBeNull();
    expect(normalizeInstagramHandle(undefined)).toBeNull();
  });

  it("rejeita valores que poderiam injetar caminho ou consulta em URL externa", () => {
    const invalidos = [
      "https://instagram.com/ana",
      "ana?u=evil.example",
      "ana/x",
      "ana#f",
      "ana;rm",
      "ana$",
      "a".repeat(31),
      "anã",
      "ana paula",
    ];
    for (const raw of invalidos) {
      expect(normalizeInstagramHandle(raw)).toBeNull();
    }
  });
});
