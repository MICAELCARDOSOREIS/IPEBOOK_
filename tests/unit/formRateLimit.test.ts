import { describe, expect, it } from "vitest";
import { ClientRateLimiter } from "@/infra/services/clientRateLimiter";
import {
  DEFAULT_FORM_ATTEMPTS,
  formKey,
  guardFormSubmit,
} from "@/viewmodel/formRateLimit";

describe("limite de envios de formulário (ADR 0027)", () => {
  it("libera as tentativas dentro do limite e bloqueia a seguinte", () => {
    const rateLimiter = new ClientRateLimiter();

    for (let attempt = 1; attempt <= DEFAULT_FORM_ATTEMPTS; attempt += 1) {
      expect(guardFormSubmit(rateLimiter, "acao").allowed).toBe(true);
    }

    const bloqueado = guardFormSubmit(rateLimiter, "acao");
    expect(bloqueado.allowed).toBe(false);
    if (!bloqueado.allowed) {
      expect(bloqueado.message).toMatch(/^Muitas tentativas seguidas\. Tente de novo em /);
    }
  });

  it("conta tentativas por chave, sem misturar ações diferentes", () => {
    const rateLimiter = new ClientRateLimiter();

    for (let attempt = 1; attempt <= DEFAULT_FORM_ATTEMPTS; attempt += 1) {
      guardFormSubmit(rateLimiter, "acao:a");
    }

    expect(guardFormSubmit(rateLimiter, "acao:a").allowed).toBe(false);
    expect(guardFormSubmit(rateLimiter, "acao:b").allowed).toBe(true);
  });

  it("respeita um limite menor quando a ação pede mais cuidado", () => {
    const rateLimiter = new ClientRateLimiter();

    expect(guardFormSubmit(rateLimiter, "recuperar", 2).allowed).toBe(true);
    expect(guardFormSubmit(rateLimiter, "recuperar", 2).allowed).toBe(true);
    expect(guardFormSubmit(rateLimiter, "recuperar", 2).allowed).toBe(false);
  });

  it("libera de novo depois que a janela passa", () => {
    const rateLimiter = new ClientRateLimiter();

    guardFormSubmit(rateLimiter, "curta", 1, 10);
    expect(guardFormSubmit(rateLimiter, "curta", 1, 10).allowed).toBe(false);

    const antes = Date.now();
    while (Date.now() - antes < 15) {
      // espera a janela de 10 ms fechar
    }

    expect(guardFormSubmit(rateLimiter, "curta", 1, 10).allowed).toBe(true);
  });

  it("anuncia a espera em segundos ou em minutos conforme o tempo restante", () => {
    const curto = guardFormSubmit(
      { checkAndRecord: () => ({ allowed: false, remainingAttempts: 0, retryAfterMs: 2500 }), reset: () => {}, getTimeUntilResetMs: () => 0 },
      "x",
    );
    const longo = guardFormSubmit(
      { checkAndRecord: () => ({ allowed: false, remainingAttempts: 0, retryAfterMs: 125_000 }), reset: () => {}, getTimeUntilResetMs: () => 0 },
      "x",
    );
    const umSegundo = guardFormSubmit(
      { checkAndRecord: () => ({ allowed: false, remainingAttempts: 0, retryAfterMs: 400 }), reset: () => {}, getTimeUntilResetMs: () => 0 },
      "x",
    );

    expect(curto.allowed === false && curto.message).toContain("3 segundos");
    expect(longo.allowed === false && longo.message).toContain("3 minutos");
    expect(umSegundo.allowed === false && umSegundo.message).toContain("1 segundo.");
  });

  it("monta a chave por ação e alvo, normalizando o alvo", () => {
    expect(formKey("auth:signIn", "  Pessoa@Exemplo.com ")).toBe("auth:signIn:pessoa@exemplo.com");
    expect(formKey("auth:signIn", null)).toBe("auth:signIn");
    expect(formKey("auth:signIn", "   ")).toBe("auth:signIn");
  });
});
