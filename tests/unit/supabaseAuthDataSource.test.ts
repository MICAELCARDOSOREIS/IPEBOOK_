import { describe, expect, it, vi } from "vitest";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { AuthError, EmailAlreadyRegisteredError, ExpiredLinkError } from "@/model/errors";
import { MIN_PASSWORD_LENGTH, validateNewPassword } from "@/model/validators/authValidator";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(auth: Record<string, unknown>): SupabaseAppClient {
  return { auth } as unknown as SupabaseAppClient;
}

describe("SupabaseAuthDataSource (Issue #97)", () => {
  it("cria a conta quando o e-mail é novo", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "u1", email: "nova@exemplo.com", identities: [{ id: "i1" }], user_metadata: {} } },
        error: null,
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    const user = await ds.signUp("nova@exemplo.com", "senha12345", "Nova Pessoa");
    expect(user).toEqual({ id: "u1", email: "nova@exemplo.com", name: "Nova Pessoa" });
  });

  it("lança EmailAlreadyRegisteredError quando o e-mail já está cadastrado e confirmado", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "u1", email: "existente@exemplo.com", identities: [], user_metadata: {} } },
        error: null,
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("existente@exemplo.com", "senha12345", "Nome")).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it("lança AuthError genérico quando o Supabase retorna erro no cadastro", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "falhou" } }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("a@b.com", "senha12345", "Nome")).rejects.toThrow("falhou");
  });

  it("lança AuthError com mensagem amigável de limite de tentativas quando o Supabase retorna rate limit (429)", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "For security purposes, you can only request this after 43 seconds.", status: 429, code: "over_email_send_rate_limit" },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("a@b.com", "senha12345", "Nome")).rejects.toThrow(
      "Muitas tentativas em pouco tempo. Aguarde alguns instantes antes de tentar novamente.",
    );
  });

  it("lança AuthError com a mensagem de senha derivada do validador (Spec 125 D6)", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Password should be at least 6 characters.", status: 400, code: "weak_password" },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("a@b.com", "senha12345", "Nome")).rejects.toThrow(
      `A senha deve conter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
    expect(validateNewPassword("a".repeat(MIN_PASSWORD_LENGTH - 1)).isValid).toBe(false);
  });

  it("lança EmailAlreadyRegisteredError quando o Supabase retorna erro de usuário existente", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "User already registered", status: 400, code: "user_already_exists" },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("existente@exemplo.com", "senha12345", "Nome")).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it("signIn lança mensagem amigável quando e-mail ainda não foi confirmado", async () => {
    const client = fakeClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Email not confirmed", status: 400 },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signIn("a@b.com", "senha12345")).rejects.toThrow(
      "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    );
  });

  it("signIn lança mensagem amigável de conexão quando a rede falha", async () => {
    const client = fakeClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Network request failed", status: 0 },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signIn("a@b.com", "senha12345")).rejects.toThrow(
      "Sem conexão com a internet. Verifique sua rede e tente novamente.",
    );
  });

  it("signUp lança mensagem amigável de conexão quando a rede falha", async () => {
    const client = fakeClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Failed to fetch", status: 0 },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.signUp("a@b.com", "senha12345", "Nome")).rejects.toThrow(
      "Sem conexão com a internet. Verifique sua rede e tente novamente.",
    );
  });

  it("requestPasswordReset lança mensagem amigável de conexão quando a rede falha", async () => {
    const client = fakeClient({
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        error: { message: "fetch failed" },
      }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.requestPasswordReset("a@b.com")).rejects.toThrow(
      "Sem conexão com a internet. Verifique sua rede e tente novamente.",
    );
  });

  it("signIn encerra com mensagem de timeout quando a conexão fica travada", async () => {
    vi.useFakeTimers();
    try {
      const client = fakeClient({
        signInWithPassword: vi.fn(() => new Promise(() => {})),
      });
      const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
      const expectation = expect(ds.signIn("a@b.com", "senha12345")).rejects.toThrow(
        "Tempo limite de conexão esgotado. Verifique sua internet e tente novamente.",
      );
      await vi.advanceTimersByTimeAsync(16_000);
      await expectation;
    } finally {
      vi.useRealTimers();
    }
  });

  it("completePasswordReset lança ExpiredLinkError quando não há link", async () => {
    const client = fakeClient({});
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(ds.completePasswordReset(null, "nova-senha")).rejects.toBeInstanceOf(ExpiredLinkError);
  });

  it("completePasswordReset lança ExpiredLinkError quando a troca do código falha", async () => {
    const client = fakeClient({
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: "código inválido" } }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(
      ds.completePasswordReset("ipebook://redefinir-senha?code=abc", "nova-senha"),
    ).rejects.toBeInstanceOf(ExpiredLinkError);
  });

  it("completePasswordReset lança ExpiredLinkError quando a sessão não é criada", async () => {
    const client = fakeClient({
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await expect(
      ds.completePasswordReset("ipebook://redefinir-senha?code=abc", "nova-senha"),
    ).rejects.toBeInstanceOf(ExpiredLinkError);
  });

  it("completePasswordReset atualiza a senha com sucesso", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const client = fakeClient({
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "t" } }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut,
    });
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await ds.completePasswordReset("ipebook://redefinir-senha?code=abc", "nova-senha");
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  describe("retorno de autenticação com tokens crus (auditoria de segurança)", () => {
    const tokensNoHash = "ipebook://auth/callback#access_token=a&refresh_token=r";
    const atacante = { id: "atacante", email: "a@x.com", user_metadata: {} };

    it("recusa tokens vindos na query string", async () => {
      const setSession = vi.fn();
      const ds = new SupabaseAuthDataSource(
        fakeClient({ setSession, getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) }),
        "https://app/redefinir-senha",
      );
      await expect(ds.setSessionFromUrl("https://ipebook.app/auth/callback?access_token=a&refresh_token=r")).rejects.toBeInstanceOf(AuthError);
      expect(setSession).not.toHaveBeenCalled();
    });

    it("não troca uma sessão ativa pela conta de outra pessoa", async () => {
      const setSession = vi.fn().mockResolvedValue({ data: { user: atacante }, error: null });
      const ds = new SupabaseAuthDataSource(
        fakeClient({
          setSession,
          getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "vitima", email: "v@x.com" } } }, error: null }),
        }),
        "https://app/redefinir-senha",
      );
      await expect(ds.setSessionFromUrl(tokensNoHash)).rejects.toBeInstanceOf(AuthError);
      expect(setSession).not.toHaveBeenCalled();
    });

    it("aceita tokens no hash quando não há sessão (confirmação de e-mail)", async () => {
      const setSession = vi.fn().mockResolvedValue({ data: { user: atacante }, error: null });
      const ds = new SupabaseAuthDataSource(
        fakeClient({ setSession, getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) }),
        "https://app/redefinir-senha",
      );
      await expect(ds.setSessionFromUrl(tokensNoHash)).resolves.toMatchObject({ id: "atacante" });
    });

    it("traduz o link expirado devolvido pelo provedor em ExpiredLinkError", async () => {
      const ds = new SupabaseAuthDataSource(fakeClient({}), "https://app/redefinir-senha");
      await expect(
        ds.setSessionFromUrl(
          "ipebook://auth/callback#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
        ),
      ).rejects.toBeInstanceOf(ExpiredLinkError);
    });

    it("traduz a recusa do provedor sem expiração em falha de login", async () => {
      const ds = new SupabaseAuthDataSource(fakeClient({}), "https://app/redefinir-senha");
      await expect(ds.setSessionFromUrl("ipebook://auth/callback#error=access_denied")).rejects.toThrow(
        "Não foi possível concluir o login com o provedor. Tente novamente.",
      );
    });
  });

  it("apaga as fotos da pessoa no storage antes de excluir a conta (LGPD)", async () => {
    const ordem: string[] = [];
    const list = vi.fn(async (prefix: string) => {
      if (prefix === "u1") return { data: [{ name: "livro1", id: null }, { name: "avatar.jpg", id: "f0" }], error: null };
      if (prefix === "u1/livro1") return { data: [{ name: "capa.jpg", id: "f1" }], error: null };
      return { data: [], error: null };
    });
    const remove = vi.fn(async (paths: string[]) => { ordem.push(`remove:${[...paths].sort().join(",")}`); return { error: null }; });
    const client = {
      auth: { signOut: vi.fn().mockResolvedValue({ error: null }) },
      storage: { from: vi.fn(() => ({ list, remove })) },
      rpc: vi.fn(async () => { ordem.push("rpc"); return { error: null }; }),
    } as unknown as SupabaseAppClient;
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");
    await ds.deleteAccount("u1");
    expect(ordem).toEqual(["remove:u1/avatar.jpg,u1/livro1/capa.jpg", "rpc"]);
  });

  it("não exclui a conta quando a limpeza do storage falha", async () => {
    const rpc = vi.fn();
    const client = {
      auth: { signOut: vi.fn() },
      storage: {
        from: vi.fn(() => ({
          list: vi.fn().mockResolvedValue({ data: null, error: new Error("storage indisponível") }),
          remove: vi.fn(),
        })),
      },
      rpc,
    } as unknown as SupabaseAppClient;
    const ds = new SupabaseAuthDataSource(client, "https://app/redefinir-senha");

    await expect(ds.deleteAccount("u1")).rejects.toBeInstanceOf(AuthError);
    expect(rpc).not.toHaveBeenCalled();
  });
});
