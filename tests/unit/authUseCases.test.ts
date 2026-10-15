import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("autenticação: criar conta, entrar e sair (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("cria conta com e-mail e senha válidos e mantém sessão autenticada", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signUp("pessoa@exemplo.com", "12345678");

    expect(user.email).toBe("pessoa@exemplo.com");
    await expect(useCases.getSession()).resolves.toEqual(user);
  });

  it("rejeita criação de conta com e-mail já cadastrado (FR-002)", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");

    await expect(useCases.signUp("pessoa@exemplo.com", "outrasenha")).rejects.toThrow(AuthError);
  });

  it("rejeita criação de conta com e-mail ou senha em formato inválido (FR-001)", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());

    await expect(useCases.signUp("invalido", "12345678")).rejects.toThrow(ValidationError);
    await expect(useCases.signUp("pessoa@exemplo.com", "123")).rejects.toThrow(ValidationError);
  });

  it("permite entrar com credenciais corretas após criar conta", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");
    await useCases.signOut();

    const user = await useCases.signIn("pessoa@exemplo.com", "12345678");
    expect(user.email).toBe("pessoa@exemplo.com");
  });

  it("rejeita entrada com senha incorreta sem revelar se o e-mail existe", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");

    await expect(useCases.signIn("pessoa@exemplo.com", "senhaerrada")).rejects.toThrow(
      "Credenciais inválidas.",
    );
    await expect(useCases.signIn("desconhecido@exemplo.com", "12345678")).rejects.toThrow(
      "Credenciais inválidas.",
    );
  });

  it("encerra a sessão ao sair e volta ao estado de visitante", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");

    await useCases.signOut();

    await expect(useCases.getSession()).resolves.toBeNull();
  });

  it("não troca a senha sem comprovação pelo e-mail", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");
    await useCases.signOut();

    await expect(useCases.requestPasswordReset("pessoa@exemplo.com")).rejects.toThrow(
      "Recuperação por e-mail indisponível no modo local.",
    );
    const user = await useCases.signIn("pessoa@exemplo.com", "12345678");
    expect(user.email).toBe("pessoa@exemplo.com");
  });

  it("usa a mesma resposta local para e-mail existente e inexistente", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678");
    const known = useCases.requestPasswordReset("pessoa@exemplo.com");
    const unknown = useCases.requestPasswordReset("desconhecido@exemplo.com");
    await expect(known).rejects.toThrow("Recuperação por e-mail indisponível no modo local.");
    await expect(unknown).rejects.toThrow("Recuperação por e-mail indisponível no modo local.");
  });

  it("isola a sessão retornada de alterações externas", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signUp("pessoa@exemplo.com", "12345678");
    Object.assign(user, { email: "alterado@exemplo.com" });

    const session = await useCases.getSession();
    expect(session?.email).toBe("pessoa@exemplo.com");
  });

  it("rejeita exclusão de conta quando a sessão é nula ou vazia", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await expect(useCases.deleteAccount(null)).rejects.toThrow(AuthError);
    await expect(useCases.deleteAccount("")).rejects.toThrow(AuthError);
  });

  it("exclui a conta com sucesso e encerra a sessão ativa", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signUp("titular@exemplo.com", "12345678");

    await useCases.deleteAccount(user.id);
    await expect(useCases.getSession()).resolves.toBeNull();

    await expect(useCases.signIn("titular@exemplo.com", "12345678")).rejects.toThrow(
      "Credenciais inválidas.",
    );
  });
});
