import { describe, expect, it } from "vitest";
import { normalizeEdition, truncateAtWord } from "@/model/validators/bookEdition";

describe("dados da edição vindos do ISBN (Spec 097)", () => {
  it("limpa HTML e espaços e mantém sinopse, editora, páginas e ano válidos", () => {
    expect(
      normalizeEdition({ synopsis: "  <b>Distopia</b>   futurista. ", publisher: " Companhia das Letras ", pageCount: 416, publicationYear: 2009 }),
    ).toEqual({ synopsis: "Distopia futurista.", publisher: "Companhia das Letras", pageCount: 416, publicationYear: 2009 });
  });

  it("omite o que é vazio, nulo ou inválido", () => {
    expect(normalizeEdition(undefined)).toEqual({});
    expect(normalizeEdition(null)).toEqual({});
    expect(normalizeEdition({ synopsis: "   ", publisher: "<i></i>", pageCount: 0, publicationYear: 5 })).toEqual({});
    expect(normalizeEdition({ pageCount: 1.5, publicationYear: 3000 })).toEqual({});
    expect(normalizeEdition({ pageCount: 20001 })).toEqual({});
  });

  it("não deixa o script da sinopse passar", () => {
    expect(normalizeEdition({ synopsis: "Bom livro<script>alert(1)</script> de verdade" }).synopsis).toBe("Bom livro de verdade");
  });

  it("corta a sinopse longa no fim de uma palavra, com reticências, dentro do limite", () => {
    const longa = "palavra ".repeat(600);
    const cortada = normalizeEdition({ synopsis: longa }).synopsis!;
    expect(cortada.length).toBeLessThanOrEqual(2000);
    expect(cortada.endsWith("…")).toBe(true);
    expect(cortada.endsWith("palavra…")).toBe(true);
  });

  it("limita o tamanho da editora", () => {
    expect(normalizeEdition({ publisher: "E".repeat(300) }).publisher!.length).toBe(120);
  });

  it("truncateAtWord mantém o texto curto e corta sem palavra pela metade", () => {
    expect(truncateAtWord("curto", 20)).toBe("curto");
    expect(truncateAtWord("uma frase um pouco mais longa que o limite", 20)).toBe("uma frase um pouco…");
    expect(truncateAtWord("semespacosnenhumnolimitedosecaracteres", 10)).toBe("semespaco…");
  });
});
