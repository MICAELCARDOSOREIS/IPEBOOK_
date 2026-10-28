import { afterEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { AuthError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

const openAuthSessionAsync = vi.fn();
const warmUpAsync = vi.fn().mockResolvedValue({});
vi.mock("expo-web-browser", () => ({
  openAuthSessionAsync: (...args: unknown[]) => openAuthSessionAsync(...args),
  warmUpAsync: (...args: unknown[]) => warmUpAsync(...args),
}));
// SDK 58: no Expo Go deste projeto, createURL devolvia "ipebook:///…" (sem hostUri nem expoGoConfig); o sinal
// confiável é a origem HTTP do bundle servido pelo Metro.
const bundle = vi.hoisted(() => ({ origin: "http://192.168.1.230:8081" as string | null }));
vi.mock("expo/internal/bundle-origin", () => ({ getBundleOrigin: () => bundle.origin }));

// Expo Go = "storeClient"; build de desenvolvimento (APK) = "bare"; o padrão dos testes é o Expo Go.
const env = vi.hoisted(() => ({ executionEnvironment: "storeClient" as string }));
vi.mock("expo-constants", () => ({
  default: { get executionEnvironment() { return env.executionEnvironment; } },
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
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
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
      expect.objectContaining({ createTask: false }),
    );
    expect(warmUpAsync).toHaveBeenCalled();
    expect(auth.setSession).toHaveBeenCalledWith({ access_token: "AT", refresh_token: "RT" });
    expect(user).toEqual({ id: "u1", email: "ana@exemplo.com", name: "Ana" });
  });

  it("no app instalado volta por ipebook://auth/callback, com host, aceito pela lista do Supabase", async () => {
    Platform.OS = "android";
    bundle.origin = null;
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({ type: "success", url: "ipebook://auth/callback#access_token=AT&refresh_token=RT" });
    await ds.signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "ipebook://auth/callback", skipBrowserRedirect: true },
    });
    bundle.origin = "http://192.168.1.230:8081";
  });

  it("no APK de desenvolvimento, mesmo com Metro ativo, volta por ipebook://auth/callback (não por exp://)", async () => {
    Platform.OS = "android";
    env.executionEnvironment = "bare";
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({ type: "success", url: "ipebook://auth/callback#access_token=AT&refresh_token=RT" });
    await ds.signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "ipebook://auth/callback", skipBrowserRedirect: true },
    });
    env.executionEnvironment = "storeClient";
  });

  it("cancelar no navegador não cria sessão e avisa", async () => {
    Platform.OS = "android";
    const { auth, ds } = client();
    openAuthSessionAsync.mockResolvedValue({ type: "cancel" });
    await expect(ds.signInWithGoogle()).rejects.toBeInstanceOf(AuthError);
    expect(auth.setSession).not.toHaveBeenCalled();
  });
});
