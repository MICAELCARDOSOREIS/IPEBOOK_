import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";

describe("autenticação: criar conta, entrar e sair (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("cria conta com e-mail e senha válidos e mantém sessão autenticada", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");

    expect(user.email).toBe("pessoa@exemplo.com");
    await expect(useCases.getSession()).resolves.toEqual(user);
  });

  it("rejeita criação de conta com e-mail já cadastrado (FR-002)", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");

    await expect(useCases.signUp("pessoa@exemplo.com", "outrasenha", "Leitora Teste")).rejects.toThrow(AuthError);
  });

  it("rejeita criação de conta com e-mail ou senha em formato inválido (FR-001)", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());

    await expect(useCases.signUp("invalido", "12345678", "Leitora Teste")).rejects.toThrow(ValidationError);
    await expect(useCases.signUp("pessoa@exemplo.com", "123", "Leitora Teste")).rejects.toThrow(ValidationError);
  });

  it("permite entrar com credenciais corretas após criar conta", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");
    await useCases.signOut();

    const user = await useCases.signIn("pessoa@exemplo.com", "12345678");
    expect(user.email).toBe("pessoa@exemplo.com");
  });

  it("rejeita entrada com senha incorreta sem revelar se o e-mail existe", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");

    await expect(useCases.signIn("pessoa@exemplo.com", "senhaerrada")).rejects.toThrow(
      "Credenciais inválidas.",
    );
    await expect(useCases.signIn("desconhecido@exemplo.com", "12345678")).rejects.toThrow(
      "Credenciais inválidas.",
    );
  });

  it("encerra a sessão ao sair e volta ao estado de visitante", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");

    await useCases.signOut();

    await expect(useCases.getSession()).resolves.toBeNull();
  });

  it("autentica com Google e mantém sessão autenticada", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signInWithGoogle();

    expect(user.id).toBe("google-dev-user");
    expect(user.email).toBe("leitor.piripiri@gmail.com");
    await expect(useCases.getSession()).resolves.toEqual(user);
  });

  it("não troca a senha sem comprovação pelo e-mail", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");
    await useCases.signOut();

    await expect(useCases.requestPasswordReset("pessoa@exemplo.com")).rejects.toThrow(
      "Recuperação por e-mail indisponível no modo local.",
    );
    const user = await useCases.signIn("pessoa@exemplo.com", "12345678");
    expect(user.email).toBe("pessoa@exemplo.com");
  });

  it("usa a mesma resposta local para e-mail existente e inexistente", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");
    const known = useCases.requestPasswordReset("pessoa@exemplo.com");
    const unknown = useCases.requestPasswordReset("desconhecido@exemplo.com");
    await expect(known).rejects.toThrow("Recuperação por e-mail indisponível no modo local.");
    await expect(unknown).rejects.toThrow("Recuperação por e-mail indisponível no modo local.");
  });

  it("isola a sessão retornada de alterações externas", async () => {
    const useCases = new AuthUseCases(new MemoryAuthDataSource());
    const user = await useCases.signUp("pessoa@exemplo.com", "12345678", "Leitora Teste");
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
    const user = await useCases.signUp("titular@exemplo.com", "12345678", "Leitora Teste");

    await useCases.deleteAccount(user.id);
    await expect(useCases.getSession()).resolves.toBeNull();

    await expect(useCases.signIn("titular@exemplo.com", "12345678")).rejects.toThrow(
      "Credenciais inválidas.",
    );
  });

  it("propaga o nome ao perfil público no signUp, signInWithGoogle e setSessionFromUrl, ignorando falhas do perfil", async () => {
    const ensure = async (userId: string, defaultName: string) => {
      if (userId === "erro-perfil") throw new Error("Falha transitória");
      return { userId, name: defaultName, joinedAt: "2026-10-20T00:00:00Z" };
    };
    const baseAuth = new MemoryAuthDataSource();
    const useCases = new AuthUseCases(baseAuth, {
      ensure,
      findById: async () => null,
      update: async () => {
        throw new Error("não usado");
      },
    });

    const created = await useCases.signUp("novo@exemplo.com", "12345678", "Ana Maria");
    expect(created.email).toBe("novo@exemplo.com");

    const googleUser = await useCases.signInWithGoogle();
    expect(googleUser.id).toBe("google-dev-user");

    await expect(useCases.completePasswordReset(null, "123")).rejects.toThrow(ValidationError);
    await expect(useCases.completePasswordReset("token", "12345678")).rejects.toThrow();
  });

  it("trata signInWithGoogle e setSessionFromUrl ausentes ou pendentes no datasource", async () => {
    const ensured: Array<{ id: string; name: string }> = [];
    const minimalDataSource = {
      signUp: async () => ({ id: "erro-perfil", email: "a@b.com" }),
      signIn: async () => ({ id: "1", email: "a@b.com" }),
      signOut: async () => {},
      currentUser: async () => null,
      requestPasswordReset: async () => {},
      completePasswordReset: async () => {},
      deleteAccount: async () => {},
    };
    const useCasesWithoutOptional = new AuthUseCases(minimalDataSource, {
      ensure: async () => {
        throw new Error("falha ignorada");
      },
      findById: async () => null,
      update: async () => {
        throw new Error("não usado");
      },
    });

    await expect(useCasesWithoutOptional.signUp("a@b.com", "12345678", "Nome")).resolves.toEqual({
      id: "erro-perfil",
      email: "a@b.com",
    });
    await expect(useCasesWithoutOptional.signInWithGoogle()).rejects.toThrow("Login com Google indisponível.");
    await expect(useCasesWithoutOptional.setSessionFromUrl("https://ipebook.app/auth/callback")).rejects.toThrow(
      "Processamento de retorno de autenticação indisponível.",
    );

    const useCasesWithSessionUrl = new AuthUseCases(
      {
        ...minimalDataSource,
        signInWithGoogle: async () => ({ id: "pending", email: "" }),
        setSessionFromUrl: async (url) =>
          url.includes("sem-nome")
            ? { id: "u-sem-nome", email: "u@b.com", name: "" }
            : { id: "pending", email: "" },
      },
      {
        ensure: async (id, name) => {
          ensured.push({ id, name });
          return { userId: id, name, joinedAt: "2026-10-20T00:00:00Z" };
        },
        findById: async () => null,
        update: async () => {
          throw new Error("não usado");
        },
      },
    );

    await useCasesWithSessionUrl.signInWithGoogle();
    await useCasesWithSessionUrl.setSessionFromUrl("https://ipebook.app/auth/callback?pending=1");
    expect(ensured).toHaveLength(0);

    await useCasesWithSessionUrl.setSessionFromUrl("https://ipebook.app/auth/callback?sem-nome=1");
    expect(ensured).toEqual([{ id: "u-sem-nome", name: "Leitor IpêBook" }]);
  });
});
