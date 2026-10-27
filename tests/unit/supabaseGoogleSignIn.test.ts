import { afterEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { AuthError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

const openAuthSessionAsync = vi.fn();
vi.mock("expo-web-browser", () => ({ openAuthSessionAsync: (...args: unknown[]) => openAuthSessionAsync(...args) }));
// SDK 58: no Expo Go, createURL devolvia o esquema do app ("ipebook:///…"), que o Expo Go não abre;
// por isso o retorno vem de Constants.experienceUrl.
const constants = vi.hoisted(() => ({ executionEnvironment: "storeClient", experienceUrl: "exp://192.168.1.230:8081" }));
vi.mock("expo-constants", () => ({
  default: constants,
  ExecutionEnvironment: { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" },
}));

function client() {
  const auth = {
    signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: "https://supabase/auth/v1/authorize?provider=google" }, error: null }),
    setSession: vi.fn().mockResolvedValue({
      data: { user: { id: "u1", email: "ana@exemplo.com", user_metadata: { full_name: "Ana" } } },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
  return { auth, ds: new SupabaseAuthDataSource({ auth } as unknown as SupabaseAppClient, "https://app/redefinir-senha") };
}

describe("Login com Google no app nativo (Spec 085)", () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    openAuthSessionAsync.mockReset();
  });

  it("abre a sessão de autenticação no app, volta pelo deep link do Expo e cria a sessão", async () => {
    Platform.OS = "android";
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "exp://192.168.1.230:8081/--/auth/callback#access_token=AT&refresh_token=RT",
    });

    const user = await ds.signInWithGoogle();

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "exp://192.168.1.230:8081/--/auth/callback", skipBrowserRedirect: true },
    });
    expect(openAuthSessionAsync).toHaveBeenCalledWith(
      "https://supabase/auth/v1/authorize?provider=google",
      "exp://192.168.1.230:8081/--/auth/callback",
    );
    expect(auth.setSession).toHaveBeenCalledWith({ access_token: "AT", refresh_token: "RT" });
    expect(user).toEqual({ id: "u1", email: "ana@exemplo.com", name: "Ana" });
  });

  it("no app instalado volta por ipebook://auth/callback, com host, aceito pela lista do Supabase", async () => {
    Platform.OS = "android";
    constants.executionEnvironment = "standalone";
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({ type: "success", url: "ipebook://auth/callback#access_token=AT&refresh_token=RT" });
    await ds.signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "ipebook://auth/callback", skipBrowserRedirect: true },
    });
    constants.executionEnvironment = "storeClient";
  });

  it("cancelar no navegador não cria sessão e avisa", async () => {
    Platform.OS = "android";
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({ type: "cancel" });
    await expect(ds.signInWithGoogle()).rejects.toBeInstanceOf(AuthError);
    expect(auth.setSession).not.toHaveBeenCalled();
  });
});
