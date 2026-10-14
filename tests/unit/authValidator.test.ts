import { describe, expect, it } from "vitest";
import { validateAuthPayload } from "@/model/validators/authValidator";

describe("validação unitária de autenticação (ISO/IEC 25010 - Adequação Funcional)", () => {
  describe("validateAuthPayload", () => {
    it("aprova e-mail e senha válidos", () => {
      const result = validateAuthPayload({
        email: "leitor@example.com",
        password: "senhaSegura123",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("aprova senha no limite mínimo de 8 caracteres (caso de borda)", () => {
      const result = validateAuthPayload({
        email: "leitor@example.com",
        password: "12345678",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejeita payload nulo, indefinido ou tipo não-objeto", () => {
      expect(validateAuthPayload(null).isValid).toBe(false);
      expect(validateAuthPayload(undefined).isValid).toBe(false);
      expect(validateAuthPayload("credenciais em string").isValid).toBe(false);
      expect(validateAuthPayload(42).isValid).toBe(false);
    });

    it("rejeita e-mail ausente ou vazio", () => {
      const result = validateAuthPayload({ email: "   ", password: "senhaSegura123" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("E-mail é obrigatório.");
    });

    it("rejeita e-mail em formato inválido", () => {
      const result = validateAuthPayload({ email: "nao-e-email", password: "senhaSegura123" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("E-mail em formato inválido.");
    });

    it("rejeita senha ausente ou vazia", () => {
      const result = validateAuthPayload({ email: "leitor@example.com", password: "" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Senha é obrigatória.");
    });

    it("rejeita senha com menos de 8 caracteres", () => {
      const result = validateAuthPayload({ email: "leitor@example.com", password: "1234567" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Senha deve conter no mínimo 8 caracteres.");
    });

    it("acumula múltiplos erros quando vários campos violam regras", () => {
      const result = validateAuthPayload({ email: "nao-e-email", password: "123" });

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([
        "E-mail em formato inválido.",
        "Senha deve conter no mínimo 8 caracteres.",
      ]);
    });
  });
});
