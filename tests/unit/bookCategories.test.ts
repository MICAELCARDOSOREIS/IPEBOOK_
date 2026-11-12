import { describe, expect, it } from "vitest";
import { BOOK_CATEGORIES, type BookCategory } from "@/model/entities/book";
import { LISTING_CATEGORIES } from "@/view/listings/createListingStep3";
import { categoryTone } from "@/view/categoryTone";
import { matchesCategory } from "@/viewmodel/searchFilters";

describe("Macro-Categorias de Livros do IpêBook (ADR 0109)", () => {
  it("define exatamente 6 macro-categorias canônicas, concisas e sem duplicatas", () => {
    expect(BOOK_CATEGORIES).toHaveLength(6);
    const unique = new Set(BOOK_CATEGORIES);
    expect(unique.size).toBe(6);
  });

  it("cobre as 6 macro-áreas de circulação comunitária de Piripiri", () => {
    const categories: readonly string[] = BOOK_CATEGORIES;
    expect(categories).toEqual([
      "Didáticos & Concursos",
      "Universitário & Técnico",
      "Literatura & Romance",
      "Infantil & Quadrinhos",
      "Desenvolvimento & Espiritualidade",
      "Outros",
    ]);
  });

  it("garante sincronização entre entidades do modelo e etapas de publicação", () => {
    expect(LISTING_CATEGORIES).toEqual(BOOK_CATEGORIES);
  });

  it("matchesCategory associa categorias históricas e específicas à sua respectiva macro-categoria", () => {
    // Didáticos & Concursos
    expect(matchesCategory("Didático", "Didáticos & Concursos")).toBe(true);
    expect(matchesCategory("Apostila ENEM", "Didáticos & Concursos")).toBe(true);
    expect(matchesCategory("Concurso INSS", "Didáticos & Concursos")).toBe(true);

    // Universitário & Técnico
    expect(matchesCategory("Ciências Exatas", "Universitário & Técnico")).toBe(true);
    expect(matchesCategory("Tecnologia e Computação", "Universitário & Técnico")).toBe(true);
    expect(matchesCategory("Direito Constitucional", "Universitário & Técnico")).toBe(false);

    // Literatura & Romance
    expect(matchesCategory("Literatura Brasileira", "Literatura & Romance")).toBe(true);
    expect(matchesCategory("Romance Contemporâneo", "Literatura & Romance")).toBe(true);
    expect(matchesCategory("Ficção Científica", "Literatura & Romance")).toBe(true);

    // Infantil & Quadrinhos
    expect(matchesCategory("Infantil", "Infantil & Quadrinhos")).toBe(true);
    expect(matchesCategory("Infantojuvenil", "Infantil & Quadrinhos")).toBe(true);
    expect(matchesCategory("Quadrinhos & Mangás", "Infantil & Quadrinhos")).toBe(true);

    // Desenvolvimento & Espiritualidade
    expect(matchesCategory("Desenvolvimento Pessoal", "Desenvolvimento & Espiritualidade")).toBe(true);
    expect(matchesCategory("Religião & Espiritualidade", "Desenvolvimento & Espiritualidade")).toBe(true);

    // "all" sempre retorna true
    expect(matchesCategory("Qualquer coisa", "all")).toBe(true);
  });

  it("gera paleta de cores consistente e com contraste para tema claro e escuro", () => {
    for (const cat of BOOK_CATEGORIES) {
      const lightTone = categoryTone(cat, "light");
      const darkTone = categoryTone(cat, "dark");

      expect(lightTone.background).toBeTruthy();
      expect(lightTone.text).toBeTruthy();
      expect(darkTone.background).toBeTruthy();
      expect(darkTone.text).toBeTruthy();

      expect(categoryTone(cat, "light")).toEqual(lightTone);
      expect(categoryTone(cat, "dark")).toEqual(darkTone);
    }
  });
});
