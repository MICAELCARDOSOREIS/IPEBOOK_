import { createClient } from "@supabase/supabase-js";
import { Platform, Share } from "react-native";
import { defaultShareImageFile } from "@/viewmodel/shareImageFile";
import { DataSourceError } from "@/model/errors";

const mockSharingState = {
  available: true,
  shareAsync: jest.fn().mockResolvedValue(undefined),
};
const mockIntentState = {
  shouldFail: false,
  startActivityAsync: jest.fn(async (..._args: any[]) => {
    if (mockIntentState.shouldFail) throw new Error("intent falhou");
  }),
};

jest.mock("expo-sharing", () => ({
  __esModule: true,
  isAvailableAsync: async () => mockSharingState.available,
  shareAsync: (...args: unknown[]) => mockSharingState.shareAsync(...args),
}));
jest.mock("expo-file-system/legacy", () => ({
  __esModule: true,
  getContentUriAsync: async (u: string) => `content://provider/${u}`,
}));
jest.mock("expo-intent-launcher", () => ({
  __esModule: true,
  startActivityAsync: (...args: any[]) => mockIntentState.startActivityAsync(...args),
}));
jest.mock("react-native-url-polyfill/auto", () => ({}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn((url: string, key: string, options: unknown) => ({ url, key, options })),
}));

import { createSupabaseAppClient } from "@/infra/supabaseClient";

describe("defaultShareImageFile e createSupabaseAppClient", () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    mockSharingState.available = true;
    mockSharingState.shareAsync.mockClear();
    mockIntentState.shouldFail = false;
    mockIntentState.startActivityAsync.mockClear();
  });

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it("no iOS compartilha imagem e mensagem via Share.share", async () => {
    Platform.OS = "ios";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction } as never);

    const ok = await defaultShareImageFile("file:///tmp/card.png", "Confira este livro!");
    expect(ok).toBe(true);
    expect(shareSpy).toHaveBeenCalledWith({
      message: "Confira este livro!",
      url: "file:///tmp/card.png",
    });
  });

  it("na web ou fallback usa expo-sharing quando disponível e retorna false se indisponível", async () => {
    Platform.OS = "web";
    mockSharingState.available = true;

    await expect(defaultShareImageFile("file:///tmp/card.png", "Mensagem", "Título")).resolves.toBe(true);
    expect(mockSharingState.shareAsync).toHaveBeenCalledWith("file:///tmp/card.png", {
      mimeType: "image/png",
      dialogTitle: "Título",
    });

    mockSharingState.available = false;
    await expect(defaultShareImageFile("file:///tmp/card.png", "Mensagem")).resolves.toBe(false);
  });

  it("no Android envia via IntentLauncher com contentUri e cai no fallback se falhar", async () => {
    Platform.OS = "android";
    mockIntentState.shouldFail = false;

    await expect(defaultShareImageFile("file:///tmp/card.png", "Legenda")).resolves.toBe(true);
    expect(mockIntentState.startActivityAsync).toHaveBeenCalledTimes(1);

    mockIntentState.shouldFail = true;
    await expect(defaultShareImageFile("file:///tmp/card.png", "Legenda")).resolves.toBe(true);
    expect(mockSharingState.shareAsync).toHaveBeenCalledTimes(1);
  });

  it("createSupabaseAppClient valida URL https e chave sb_publishable_ em web e nativo", () => {
    expect(() => createSupabaseAppClient("http://inseguro.supabase.co", "sb_publishable_123")).toThrow(
      DataSourceError,
    );
    expect(() => createSupabaseAppClient("https://projeto.supabase.co", "chave_invalida")).toThrow(
      "Configuração do serviço indisponível.",
    );

    Platform.OS = "web";
    const webClient = createSupabaseAppClient("https://projeto.supabase.co", "sb_publishable_valida123");
    expect(webClient).toBeDefined();
    expect(createClient).toHaveBeenLastCalledWith(
      "https://projeto.supabase.co",
      "sb_publishable_valida123",
      { auth: expect.objectContaining({ flowType: "pkce", detectSessionInUrl: false }) },
    );

    Platform.OS = "android";
    const nativeClient = createSupabaseAppClient("https://projeto.supabase.co", "sb_publishable_valida123");
    expect(nativeClient).toBeDefined();
    expect(createClient).toHaveBeenLastCalledWith(
      "https://projeto.supabase.co",
      "sb_publishable_valida123",
      { auth: expect.objectContaining({ flowType: "implicit" }) },
    );
  });
});
