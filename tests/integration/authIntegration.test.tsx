import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("testes de integração: autenticação (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("integra criar conta, entrar e sair através das camadas reais (US1, US3)", async () => {
    const dataSource = new MemoryAuthDataSource();
    const useCases = new AuthUseCases(dataSource);

    const created = await useCases.signUp("leitora@exemplo.com", "umasenha123");
    expect(created.email).toBe("leitora@exemplo.com");
    await expect(useCases.getSession()).resolves.toEqual(created);

    await useCases.signOut();
    await expect(useCases.getSession()).resolves.toBeNull();

    const signedIn = await useCases.signIn("leitora@exemplo.com", "umasenha123");
    expect(signedIn).toEqual(created);
    await expect(useCases.getSession()).resolves.toEqual(created);
  });

  it("mantém isolamento entre contas e impede duplicidade de e-mail entre si", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());

    await useCases.signUp("primeira@exemplo.com", "senha-valida-1");
    await useCases.signUp("segunda@exemplo.com", "senha-valida-2");

    await expect(useCases.signUp("primeira@exemplo.com", "outra-senha")).rejects.toThrow(
      "Este e-mail já está em uso.",
    );
  });
});
