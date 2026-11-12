import Module from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Platform, Share } from "react-native";
import { defaultShareImageFile } from "@/viewmodel/shareImageFile";
import { DataSourceError } from "@/model/errors";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((url: string, key: string, options: unknown) => ({ url, key, options })),
}));

import { createSupabaseAppClient } from "@/infra/supabaseClient";

describe("defaultShareImageFile e createSupabaseAppClient", () => {
  const originalOS = Platform.OS;
  const originalRequire = Module.prototype.require;

  afterEach(() => {
    Platform.OS = originalOS;
    Module.prototype.require = originalRequire;
    vi.restoreAllMocks();
  });

  it("no iOS compartilha imagem e mensagem via Share.share", async () => {
    Platform.OS = "ios";
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction } as never);

    const ok = await defaultShareImageFile("file:///tmp/card.png", "Confira este livro!");
    expect(ok).toBe(true);
    expect(shareSpy).toHaveBeenCalledWith({
      message: "Confira este livro!",
      url: "file:///tmp/card.png",
    });
  });

  it("na web ou fallback usa expo-sharing quando disponível e retorna false se indisponível", async () => {
    Platform.OS = "web";
    let available = true;
    const shareAsync = vi.fn().mockResolvedValue(undefined);

    Module.prototype.require = function (this: unknown, id: string) {
      if (id === "expo-sharing") {
        return {
          isAvailableAsync: async () => available,
          shareAsync,
        };
      }
      return originalRequire.call(this, id);
    } as typeof Module.prototype.require;

    await expect(defaultShareImageFile("file:///tmp/card.png", "Mensagem", "Título")).resolves.toBe(true);
    expect(shareAsync).toHaveBeenCalledWith("file:///tmp/card.png", {
      mimeType: "image/png",
      dialogTitle: "Título",
    });

    available = false;
    await expect(defaultShareImageFile("file:///tmp/card.png", "Mensagem")).resolves.toBe(false);
  });

  it("no Android envia via IntentLauncher com contentUri e cai no fallback se falhar", async () => {
    Platform.OS = "android";
    let shouldFailIntent = false;
    const startActivityAsync = vi.fn(async () => {
      if (shouldFailIntent) throw new Error("intent falhou");
    });
    const shareAsync = vi.fn().mockResolvedValue(undefined);

    Module.prototype.require = function (this: unknown, id: string) {
      if (id === "expo-file-system/legacy") {
        return { getContentUriAsync: async (u: string) => `content://provider/${u}` };
      }
      if (id === "expo-intent-launcher") {
        return { startActivityAsync };
      }
      if (id === "expo-sharing") {
        return { isAvailableAsync: async () => true, shareAsync };
      }
      return originalRequire.call(this, id);
    } as typeof Module.prototype.require;

    await expect(defaultShareImageFile("file:///tmp/card.png", "Legenda")).resolves.toBe(true);
    expect(startActivityAsync).toHaveBeenCalledTimes(1);

    shouldFailIntent = true;
    await expect(defaultShareImageFile("file:///tmp/card.png", "Legenda")).resolves.toBe(true);
    expect(shareAsync).toHaveBeenCalledTimes(1);
  });

  it("createSupabaseAppClient valida URL https e chave sb_publishable_ em web e nativo", () => {
    Module.prototype.require = function (this: unknown, id: string) {
      if (id === "react-native-url-polyfill/auto") return {};
      return originalRequire.call(this, id);
    } as typeof Module.prototype.require;

    expect(() => createSupabaseAppClient("http://inseguro.supabase.co", "sb_publishable_123")).toThrow(
      DataSourceError,
    );
    expect(() => createSupabaseAppClient("https://projeto.supabase.co", "chave_invalida")).toThrow(
      "Configuração do serviço indisponível.",
    );

    Platform.OS = "web";
    const webClient = createSupabaseAppClient("https://projeto.supabase.co", "sb_publishable_valida123");
    expect(webClient).toBeDefined();

    Platform.OS = "android";
    const nativeClient = createSupabaseAppClient("https://projeto.supabase.co", "sb_publishable_valida123");
    expect(nativeClient).toBeDefined();
  });
});
