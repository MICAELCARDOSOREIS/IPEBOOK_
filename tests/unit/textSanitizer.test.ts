import { describe, expect, it } from "vitest";
import {
  containsDangerousHtml,
  sanitizeTextInput,
} from "@/model/validators/textSanitizer";

describe("TextSanitizer", () => {
  describe("sanitizeTextInput", () => {
    it("preserva caracteres legítimos em português com acentuação e pontuação", () => {
      const input = " Dom Casmurro — Machado de Assis (Edição Especial, Piripiri - Piauí!) ";
      const result = sanitizeTextInput(input);
      expect(result).toBe("Dom Casmurro — Machado de Assis (Edição Especial, Piripiri - Piauí!)");
    });

    it("remove tags HTML completas e injeções de script", () => {
      const input = "Livro <script>alert('xss')</script> de Ficção";
      const result = sanitizeTextInput(input);
      expect(result).toBe("Livro de Ficção");
    });

    it("remove tags HTML inline de imagem maliciosa", () => {
      const input = "Matemática <img src=x onerror=alert(1)> Moderna";
      const result = sanitizeTextInput(input);
      expect(result).toBe("Matemática Moderna");
    });

    it("remove caracteres de controle e bytes nulos", () => {
      const input = "Texto\x00 com\x08 bytes\x1F nulos";
      const result = sanitizeTextInput(input);
      expect(result).toBe("Texto com bytes nulos");
    });

    it("colapsa espaços em branco e remove quebras de linha por padrão (título, autor)", () => {
      const input = "   Cálculo   \n\n   Volume   1   ";
      const result = sanitizeTextInput(input);
      expect(result).toBe("Cálculo Volume 1");
    });

    it("permite quebras de linha normalizadas quando allowNewlines é true", () => {
      const input = "Linha 1\r\n\r\n\r\n\r\nLinha 2  com   espaços \r\n Linha 3 ";
      const result = sanitizeTextInput(input, { allowNewlines: true });
      expect(result).toBe("Linha 1\n\nLinha 2 com espaços\nLinha 3");
    });

    it("trunca no comprimento máximo se maxLength for especificado", () => {
      const input = "Um título excessivamente longo";
      const result = sanitizeTextInput(input, { maxLength: 10 });
      expect(result).toBe("Um título ");
    });

    it("retorna string vazia para entrada vazia ou inválida", () => {
      expect(sanitizeTextInput("")).toBe("");
      expect(sanitizeTextInput(null as any)).toBe("");
      expect(sanitizeTextInput(undefined as any)).toBe("");
    });
  });

  describe("containsDangerousHtml", () => {
    it("detecta tag script", () => {
      expect(containsDangerousHtml("<script>evil()</script>")).toBe(true);
      expect(containsDangerousHtml(" <SCRIPT src='evil.js'>")).toBe(true);
    });

    it("detecta handlers de eventos JS", () => {
      expect(containsDangerousHtml("<img onerror=alert(1)>")).toBe(true);
      expect(containsDangerousHtml("onload = evil()")).toBe(true);
    });

    it("detecta protocolo javascript:", () => {
      expect(containsDangerousHtml("javascript:void(0)")).toBe(true);
    });

    it("retorna false para texto comum sem HTML malicioso", () => {
      expect(containsDangerousHtml("Livro de receitas da vovó")).toBe(false);
      expect(containsDangerousHtml("Preço: R$ 50,00 < 60,00")).toBe(false);
    });
  });
});
