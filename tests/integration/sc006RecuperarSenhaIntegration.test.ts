import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("SC-001 da spec 006 substituído pela recuperação segura da spec 007", () => {
  it("não altera a senha no modo local sem um canal de e-mail", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());

    await auth.signUp("leitora@exemplo.com", "umasenha123");
    await auth.signOut();
    await expect(auth.getSession()).resolves.toBeNull();

    await expect(auth.requestPasswordReset("leitora@exemplo.com")).rejects.toThrow(AuthError);
    const user = await auth.signIn("leitora@exemplo.com", "umasenha123");
    expect(user.email).toBe("leitora@exemplo.com");
    await expect(auth.getSession()).resolves.toEqual(user);

  });

  it("não confirma nem nega a existência de outras contas para e-mail desconhecido (FR-001)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    const owner = await auth.signUp("conhecida@exemplo.com", "umasenha123");

    await expect(auth.requestPasswordReset("desconhecida@exemplo.com")).rejects.toThrow(
      "Recuperação por e-mail indisponível no modo local.",
    );
    await expect(auth.getSession()).resolves.toEqual(owner);
    await expect(auth.signIn("conhecida@exemplo.com", "umasenha123")).resolves.toEqual(owner);
  });
});
