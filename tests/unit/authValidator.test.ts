import { describe, expect, it } from "vitest";
import {
  validateAuthPayload,
  validateFullName,
  validateSignUpPayload,
} from "@/model/validators/authValidator";

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

describe("Spec 028 — nome no cadastro", () => {
  it("aprova nome completo com dois caracteres ou mais", () => {
    expect(validateFullName("Ana Paula").isValid).toBe(true);
    expect(validateFullName("Jo").isValid).toBe(true);
  });

  it("recusa nome vazio, curto demais ou longo demais", () => {
    expect(validateFullName("").errors[0]).toBe("Nome completo é obrigatório.");
    expect(validateFullName("   ").errors[0]).toBe("Nome completo é obrigatório.");
    expect(validateFullName("A").errors[0]).toBe("Nome deve conter no mínimo 2 caracteres.");
    expect(validateFullName("a".repeat(81)).errors[0]).toBe("Nome deve conter no máximo 80 caracteres.");
  });

  it("recusa valor que não é texto", () => {
    expect(validateFullName(undefined).isValid).toBe(false);
    expect(validateFullName(42).isValid).toBe(false);
  });

  it("valida nome, e-mail e senha juntos no cadastro", () => {
    expect(
      validateSignUpPayload({ name: "Ana Paula", email: "ana@exemplo.com", password: "12345678" }).isValid,
    ).toBe(true);

    const semNome = validateSignUpPayload({ email: "ana@exemplo.com", password: "12345678" });
    expect(semNome.isValid).toBe(false);
    expect(semNome.errors[0]).toBe("Nome completo é obrigatório.");

    const tudoInvalido = validateSignUpPayload({ name: "", email: "invalido", password: "123" });
    expect(tudoInvalido.errors.length).toBe(3);
  });
});
