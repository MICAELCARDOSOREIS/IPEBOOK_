import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("SC-001: recuperar acesso à conta com senha temporária (spec 006, US1)", () => {
  it("cobre o fluxo completo pelas camadas reais (model → usecase → infra)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());

    await auth.signUp("leitora@exemplo.com", "umasenha123");
    await auth.signOut();
    await expect(auth.getSession()).resolves.toBeNull();

    const temporaryPassword = await auth.requestPasswordReset("leitora@exemplo.com");
    expect(temporaryPassword.length).toBeGreaterThanOrEqual(8);

    const user = await auth.signIn("leitora@exemplo.com", temporaryPassword);
    expect(user.email).toBe("leitora@exemplo.com");
    await expect(auth.getSession()).resolves.toEqual(user);

    await expect(auth.signIn("leitora@exemplo.com", "umasenha123")).rejects.toThrow(AuthError);
  });

  it("não confirma nem nega a existência de outras contas para e-mail desconhecido (FR-001)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    const owner = await auth.signUp("conhecida@exemplo.com", "umasenha123");

    await expect(auth.requestPasswordReset("desconhecida@exemplo.com")).rejects.toThrow(
      AuthError,
    );
    await expect(auth.getSession()).resolves.toEqual(owner);
    await expect(auth.signIn("conhecida@exemplo.com", "umasenha123")).resolves.toEqual(owner);
  });
});
