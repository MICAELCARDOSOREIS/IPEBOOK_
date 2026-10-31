import { describe, expect, it, vi } from "vitest";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { GoogleNativeSignInService } from "@/infra/services/googleNativeSignInService";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { AuthError } from "@/model/errors";
import type { INativeGoogleSignIn } from "@/model/services/iNativeGoogleSignIn";

function api(signIn: () => Promise<unknown>) {
  return {
    configure: vi.fn(),
    hasPlayServices: vi.fn().mockResolvedValue(true),
    signIn: vi.fn(signIn),
    signOut: vi.fn().mockResolvedValue(null),
  };
}

describe("GoogleNativeSignInService (Spec 106)", () => {
  it("sem ID do cliente fica indisponível", async () => {
    const service = new GoogleNativeSignInService(undefined, api(async () => ({})) as never);
    expect(service.isAvailable()).toBe(false);
    await expect(service.getIdToken()).rejects.toBeInstanceOf(AuthError);
    await expect(service.signOut()).resolves.toBeUndefined();
  });

  it("configura uma vez com o cliente web e devolve o idToken", async () => {
    const google = api(async () => ({ type: "success", data: { idToken: "tok" } }));
    const service = new GoogleNativeSignInService("web.apps.googleusercontent.com", google as never);
    expect(service.isAvailable()).toBe(true);
    await expect(service.getIdToken()).resolves.toBe("tok");
    await service.getIdToken();
    expect(google.configure).toHaveBeenCalledTimes(1);
    expect(google.configure).toHaveBeenCalledWith({ webClientId: "web.apps.googleusercontent.com" });
    await service.signOut();
    expect(google.signOut).toHaveBeenCalled();
  });

  it("cancelar devolve null; erros viram mensagens claras", async () => {
    const cases: Array<[unknown, string | null]> = [
      [{ type: "cancelled", data: null }, null],
      [{ code: "SIGN_IN_CANCELLED" }, null],
      [{ code: "IN_PROGRESS" }, "O login com Google já está em andamento."],
      [{ code: "PLAY_SERVICES_NOT_AVAILABLE" }, "Atualize o Google Play Services para entrar com Google."],
      [{ code: "OUTRO" }, "Não foi possível autenticar com o Google. Tente novamente."],
      [{ type: "success", data: { idToken: null } }, "O Google não devolveu a identificação da conta."],
    ];
    for (const [result, expected] of cases) {
      const isResponse = typeof result === "object" && result !== null && "type" in result;
      const google = api(async () => {
        if (isResponse) return result;
        throw result;
      });
      const service = new GoogleNativeSignInService("web", google as never);
      if (expected === null) await expect(service.getIdToken()).resolves.toBeNull();
      else await expect(service.getIdToken()).rejects.toThrow(expected);
    }
  });

  it("sair do Google não quebra quando o SDK falha", async () => {
    const google = api(async () => ({ type: "success", data: { idToken: "tok" } }));
    google.signOut.mockRejectedValue(new Error("x"));
    const service = new GoogleNativeSignInService("web", google as never);
    await service.getIdToken();
    await expect(service.signOut()).resolves.toBeUndefined();
  });
});

describe("SupabaseAuthDataSource com login Google nativo (Spec 106)", () => {
  function native(token: string | null, available = true): INativeGoogleSignIn & { signOut: ReturnType<typeof vi.fn> } {
    return { isAvailable: () => available, getIdToken: vi.fn().mockResolvedValue(token), signOut: vi.fn().mockResolvedValue(undefined) };
  }

  it("troca o idToken por sessão no Supabase, sem navegador", async () => {
    const signInWithIdToken = vi.fn().mockResolvedValue({
      data: { user: { id: "u1", email: "ana@x.com", user_metadata: { full_name: "Ana Lima" } } },
      error: null,
    });
    const signInWithOAuth = vi.fn();
    const client = { auth: { signInWithIdToken, signInWithOAuth } } as unknown as SupabaseAppClient;
    const user = await new SupabaseAuthDataSource(client, "x", native("tok")).signInWithGoogle();
    expect(signInWithIdToken).toHaveBeenCalledWith({ provider: "google", token: "tok" });
    expect(signInWithOAuth).not.toHaveBeenCalled();
    expect(user).toEqual({ id: "u1", email: "ana@x.com", name: "Ana Lima" });
  });

  it("cancelado ou recusado pelo Supabase vira erro de autenticação", async () => {
    const recusa = { auth: { signInWithIdToken: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "bad" } }) } } as unknown as SupabaseAppClient;
    await expect(new SupabaseAuthDataSource(recusa, "x", native(null)).signInWithGoogle()).rejects.toThrow("Login com Google cancelado.");
    await expect(new SupabaseAuthDataSource(recusa, "x", native("tok")).signInWithGoogle()).rejects.toBeInstanceOf(AuthError);
  });

  it("sem cliente configurado segue pelo navegador; sair também sai do Google", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: { url: null }, error: { message: "x" } });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const google = native("tok", false);
    const source = new SupabaseAuthDataSource({ auth: { signInWithOAuth, signOut } } as unknown as SupabaseAppClient, "x", google);
    await expect(source.signInWithGoogle()).rejects.toBeInstanceOf(AuthError);
    expect(signInWithOAuth).toHaveBeenCalled();
    await source.signOut();
    expect(google.signOut).toHaveBeenCalled();
  });

  it("com Play Services indisponível faz fallback para o navegador em vez de falhar", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: { url: null }, error: { message: "fallback" } });
    const googleSemPlayServices = {
      isAvailable: () => true,
      getIdToken: vi.fn().mockRejectedValue(new AuthError("Atualize o Google Play Services para entrar com Google.")),
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    const source = new SupabaseAuthDataSource(
      { auth: { signInWithOAuth } } as unknown as SupabaseAppClient,
      "x",
      googleSemPlayServices,
    );
    await expect(source.signInWithGoogle()).rejects.toThrow("Não foi possível autenticar com o Google. Tente novamente.");
    expect(signInWithOAuth).toHaveBeenCalled();
  });
});
