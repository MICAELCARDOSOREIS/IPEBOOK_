import { describe, expect, it, vi } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("recuperação de senha", () => {
  it("não aceita senha curta antes de chamar a infraestrutura", async () => {
    const dataSource = new MemoryAuthDataSource();
    const completePasswordReset = vi.spyOn(dataSource, "completePasswordReset");
    const auth = new AuthUseCases(dataSource);

    await expect(auth.completePasswordReset("ipebook://redefinir-senha", "curta")).rejects.toThrow(ValidationError);
    expect(completePasswordReset).not.toHaveBeenCalled();
  });

  it("não muda a senha quando o modo local não pode validar o link", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    await auth.signUp("pessoa@exemplo.com", "senha-antiga", "Leitora Teste");
    await expect(auth.completePasswordReset("ipebook://redefinir-senha", "senha-nova")).rejects.toThrow(AuthError);
    await expect(auth.signIn("pessoa@exemplo.com", "senha-antiga")).resolves.toBeDefined();
    await expect(auth.signIn("pessoa@exemplo.com", "senha-nova")).rejects.toThrow(AuthError);
  });
});
