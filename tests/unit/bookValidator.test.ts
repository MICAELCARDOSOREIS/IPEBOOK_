import { describe, expect, it } from "vitest";
import {
  formatBookDisplay,
  sanitizeBookInput,
  validateBookPayload,
} from "@/model/validators/bookValidator";

describe("validação unitária de livros (ISO/IEC 25010 - Adequação Funcional)", () => {
  describe("validateBookPayload", () => {
    it("aprova livro com todos os campos válidos", () => {
      const result = validateBookPayload({
        id: "book-1",
        title: "Dom Casmurro",
        author: "Machado de Assis",
        ownerId: "owner-1",
        modality: "sale",
        price: 29.90,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejeita categoria maior que o limite do anúncio", () => {
      const result = validateBookPayload({
        id: "book-category", title: "Livro válido", author: "Autora válida",
        ownerId: "owner-1", modality: "donation", category: "A".repeat(61),
      });
      expect(result.errors).toContain("Categoria deve ter no máximo 60 caracteres.");
    });

    it("aprova livro nos limites mínimos de caracteres (caso de borda)", () => {
      const result = validateBookPayload({
        id: "b1",
        title: "It",
        author: "Ed",
        ownerId: "owner-2",
        modality: "donation",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("aprova livro nos limites máximos exatos de caracteres (caso de borda)", () => {
      const result = validateBookPayload({
        id: "b-max",
        title: "A".repeat(150),
        author: "B".repeat(100),
        ownerId: "owner-3",
        modality: "trade",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejeita payload nulo, indefinido ou tipo não-objeto", () => {
      expect(validateBookPayload(null).isValid).toBe(false);
      expect(validateBookPayload(undefined).isValid).toBe(false);
      expect(validateBookPayload("livro em string").isValid).toBe(false);
      expect(validateBookPayload(42).isValid).toBe(false);
    });

    it("rejeita livro sem identificador ou com id vazio", () => {
      const result = validateBookPayload({
        id: "   ",
        title: "Grande Sertão: Veredas",
        author: "Guimarães Rosa",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Identificador do livro é obrigatório.");
    });

    it("rejeita livro com título curto demais (menos de 2 caracteres)", () => {
      const result = validateBookPayload({
        id: "b-short",
        title: "A",
        author: "Autor Conhecido",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Título deve conter no mínimo 2 caracteres.");
    });

    it("rejeita livro com título longo demais (mais de 150 caracteres)", () => {
      const result = validateBookPayload({
        id: "b-long",
        title: "A".repeat(151),
        author: "Autor Conhecido",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Título deve conter no máximo 150 caracteres.");
    });

    it("rejeita livro com autor curto demais ou longo demais", () => {
      const shortAuthor = validateBookPayload({
        id: "b-short-a",
        title: "Memórias Póstumas",
        author: "X",
      });
      expect(shortAuthor.isValid).toBe(false);
      expect(shortAuthor.errors).toContain("Autor deve conter no mínimo 2 caracteres.");

      const longAuthor = validateBookPayload({
        id: "b-long-a",
        title: "Memórias Póstumas",
        author: "X".repeat(101),
      });
      expect(longAuthor.isValid).toBe(false);
      expect(longAuthor.errors).toContain("Autor deve conter no máximo 100 caracteres.");
    });

    it("acumula múltiplos erros quando vários campos violam regras", () => {
      const result = validateBookPayload({
        id: "",
        title: "",
        author: "",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors).toEqual([
        "Identificador do livro é obrigatório.",
        "Título do livro é obrigatório.",
        "Autor do livro é obrigatório.",
        "Identificador do dono é obrigatório.",
        "Modalidade deve ser 'sale', 'trade' ou 'donation'.",
      ]);
    });

    it("aprova livro declarado explicitamente em Piripiri, PI com bairro", () => {
      const result = validateBookPayload({
        id: "book-piripiri",
        title: "Livro de Piripiri",
        author: "Autor Piauiense",
        ownerId: "owner-piripiri",
        modality: "donation",
        city: "Piripiri",
        state: "PI",
        neighborhood: "Centro",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejeita livro declarado fora de Piripiri, PI", () => {
      const resultOutCity = validateBookPayload({
        id: "book-teresina",
        title: "Livro de Teresina",
        author: "Autor",
        ownerId: "owner-1",
        modality: "donation",
        city: "Teresina",
        state: "PI",
      });
      expect(resultOutCity.isValid).toBe(false);
      expect(resultOutCity.errors).toContain("O Ipebook está em fase beta exclusivamente em Piripiri, PI.");

      const resultOutState = validateBookPayload({
        id: "book-fortaleza",
        title: "Livro de Fortaleza",
        author: "Autor",
        ownerId: "owner-1",
        modality: "donation",
        city: "Piripiri",
        state: "CE",
      });
      expect(resultOutState.isValid).toBe(false);
      expect(resultOutState.errors).toContain("O Ipebook está em fase beta exclusivamente em Piripiri, PI.");
    });

    it("aprova livro com foto de capa e galeria válidas", () => {
      const result = validateBookPayload({
        id: "book-photo-1",
        title: "Livro Ilustrado",
        author: "Ilustrador",
        ownerId: "owner-1",
        modality: "donation",
        photoUrl: "https://imagens.ipebook.app/livros/capa.jpg",
        photos: [
          "https://imagens.ipebook.app/livros/foto1.jpg",
          "https://imagens.ipebook.app/livros/foto2.jpg",
        ],
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejeita URL de foto de capa que não seja HTTP/HTTPS", () => {
      const result = validateBookPayload({
        id: "book-photo-bad",
        title: "Livro com URL Ruim",
        author: "Autor",
        ownerId: "owner-1",
        modality: "donation",
        photoUrl: "ftp://servidor/arquivo.png",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("URL da foto de capa deve ser um endereço HTTP ou HTTPS válido.");
    });

    it("rejeita galeria com mais de 5 fotos", () => {
      const result = validateBookPayload({
        id: "book-photo-limit",
        title: "Livro com Muitas Fotos",
        author: "Autor",
        ownerId: "owner-1",
        modality: "donation",
        photos: [
          "https://exemplo.com/1.jpg",
          "https://exemplo.com/2.jpg",
          "https://exemplo.com/3.jpg",
          "https://exemplo.com/4.jpg",
          "https://exemplo.com/5.jpg",
          "https://exemplo.com/6.jpg",
        ],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("O anúncio pode conter no máximo 5 fotos.");
    });
  });

  describe("sanitizeBookInput", () => {
    it("remove espaços em branco nas extremidades dos campos", () => {
      const sanitized = sanitizeBookInput({
        id: "  123  ",
        title: "  O Guarani  ",
        author: "  José de Alencar  ",
      });

      expect(sanitized).toEqual({
        id: "123",
        title: "O Guarani",
        author: "José de Alencar",
      });
    });

    it("preserva campos indefinidos sem quebrar", () => {
      const sanitized = sanitizeBookInput({});
      expect(sanitized).toEqual({
        id: undefined,
        title: undefined,
        author: undefined,
      });
    });
  });

  describe("formatBookDisplay", () => {
    it("formata título e autor no padrão visual estabelecido", () => {
      const formatted = formatBookDisplay({
        title: "Vidas Secas",
        author: "Graciliano Ramos",
      });
      expect(formatted).toBe("Vidas Secas — Graciliano Ramos");
    });

    it("substitui valores ausentes por texto padrão seguro", () => {
      expect(formatBookDisplay({ title: "", author: "" })).toBe("Sem título — Autor desconhecido");
      expect(formatBookDisplay({ title: "   ", author: "   " })).toBe("Sem título — Autor desconhecido");
    });
  });
});
