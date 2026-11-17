import { Platform } from "react-native";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { AuthError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

const mockOpenAuthSessionAsync = jest.fn();
const mockWarmUpAsync = jest.fn().mockResolvedValue({});
jest.mock("expo-web-browser", () => ({
  __esModule: true,
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
  warmUpAsync: (...args: unknown[]) => mockWarmUpAsync(...args),
}));
// SDK 58: no Expo Go deste projeto, createURL devolvia "ipebook:///…" (sem hostUri nem expoGoConfig); o sinal
// confiável é a origem HTTP do bundle servido pelo Metro.
const mockBundle = { origin: "http://192.168.1.230:8081" as string | null };
jest.mock("expo/internal/bundle-origin", () => ({ __esModule: true, getBundleOrigin: () => mockBundle.origin }));

// Expo Go = "storeClient"; build de desenvolvimento (APK) = "bare"; o padrão dos testes é o Expo Go.
const mockEnv = { executionEnvironment: "storeClient" as string };
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { get executionEnvironment() { return mockEnv.executionEnvironment; } },
  ExecutionEnvironment: { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" },
}));

function client() {
  const auth = {
    signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: "https://supabase/auth/v1/authorize?provider=google" }, error: null }),
    setSession: jest.fn().mockResolvedValue({
      data: { user: { id: "u1", email: "ana@exemplo.com", user_metadata: { full_name: "Ana" } } },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  };
  return { auth, ds: new SupabaseAuthDataSource({ auth } as unknown as SupabaseAppClient, "https://app/redefinir-senha") };
}

describe("Login com Google no app nativo (Spec 085)", () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    mockOpenAuthSessionAsync.mockReset();
  });

  it("abre a sessão de autenticação no app, volta pelo deep link do Expo e cria a sessão", async () => {
    Platform.OS = "android";
    const { auth, ds } = client();
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "exp://192.168.1.230:8081/--/auth/callback#access_token=AT&refresh_token=RT",
    });

    const user = await ds.signInWithGoogle();

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "exp://192.168.1.230:8081/--/auth/callback", skipBrowserRedirect: true },
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      "https://supabase/auth/v1/authorize?provider=google",
      "exp://192.168.1.230:8081/--/auth/callback",
      expect.objectContaining({ createTask: false }),
    );
    expect(mockWarmUpAsync).toHaveBeenCalled();
    expect(auth.setSession).toHaveBeenCalledWith({ access_token: "AT", refresh_token: "RT" });
    expect(user).toEqual({ id: "u1", email: "ana@exemplo.com", name: "Ana" });
  });

  it("no app instalado volta por ipebook://auth/callback, com host, aceito pela lista do Supabase", async () => {
    Platform.OS = "android";
    mockBundle.origin = null;
    const { auth, ds } = client();
    mockOpenAuthSessionAsync.mockResolvedValue({ type: "success", url: "ipebook://auth/callback#access_token=AT&refresh_token=RT" });
    await ds.signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "ipebook://auth/callback", skipBrowserRedirect: true },
    });
    mockBundle.origin = "http://192.168.1.230:8081";
  });

  it("no APK de desenvolvimento, mesmo com Metro ativo, volta por ipebook://auth/callback (não por exp://)", async () => {
    Platform.OS = "android";
    mockEnv.executionEnvironment = "bare";
    const { auth, ds } = client();
    mockOpenAuthSessionAsync.mockResolvedValue({ type: "success", url: "ipebook://auth/callback#access_token=AT&refresh_token=RT" });
    await ds.signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "ipebook://auth/callback", skipBrowserRedirect: true },
    });
    mockEnv.executionEnvironment = "storeClient";
  });

  it("cancelar no navegador não cria sessão e avisa", async () => {
    Platform.OS = "android";
    const { auth, ds } = client();
    mockOpenAuthSessionAsync.mockResolvedValue({ type: "cancel" });
    await expect(ds.signInWithGoogle()).rejects.toBeInstanceOf(AuthError);
    expect(auth.setSession).not.toHaveBeenCalled();
  });
});
