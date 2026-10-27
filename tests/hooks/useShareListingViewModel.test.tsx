import { createElement } from "react";
import { Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";

vi.mock("expo-linking", () => ({
  createURL: vi.fn((path: string) => `ipebook://${path}`),
  canOpenURL: vi.fn().mockResolvedValue(false),
  openURL: vi.fn().mockResolvedValue(undefined),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: IShareUseCases, shareImageFile?: (uri: string) => Promise<boolean>) {
  let result!: ReturnType<typeof useShareListingViewModel>;
  function HookProbe() {
    result = useShareListingViewModel(useCases, shareImageFile);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const fakeUseCases: IShareUseCases = {
  buildListingSharePath: (bookId) => `/livro/${bookId}`,
  buildShareMessage: (listing, url) => `${listing.title} de ${listing.author} — ${url}`,
  buildWhatsAppShareUrl: (message) => `whatsapp://send?text=${encodeURIComponent(message)}`,
  buildInviteMessage: () => "",
  buildWhatsAppInviteUrl: () => "",
};

const fakeListing = { title: "Dom Casmurro", author: "Machado de Assis", modality: "trade" as const };

describe("testes de hook: useShareListingViewModel (Spec 019)", () => {
  it("compartilha via menu nativo no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1");
    });
    expect(shareSpy).toHaveBeenCalledWith({ message: "https://ipebook.app/livro/b1" });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("copia o link e sinaliza confirmação na Web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1");
    });
    expect(writeText).toHaveBeenCalledWith("https://ipebook.app/livro/b1");
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
    Platform.OS = originalOS;
  });

  it("limpa a confirmação de link copiado", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1");
    });
    act(() => {
      hook.current[1].dismissLinkCopied();
    });
    expect(hook.current[0].linkCopied).toBe(false);
    Platform.OS = originalOS;
  });

  it("reporta erro de domínio ao compartilhar", async () => {
    const useCases: IShareUseCases = {
      buildListingSharePath: () => {
        throw new ValidationError("Anúncio inválido.");
      },
      buildShareMessage: () => "",
      buildWhatsAppShareUrl: () => "",
      buildInviteMessage: () => "",
      buildWhatsAppInviteUrl: () => "",
    };
    const hook = await renderHook(useCases);
    await act(async () => {
      await hook.current[1].share("");
    });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: "Anúncio inválido." });
  });

  describe("shareToWhatsApp (Issue #145)", () => {
    it("abre o WhatsApp quando o app está instalado", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "android";
      const canOpenURL = vi.fn().mockResolvedValue(true);
      const openURL = vi.fn().mockResolvedValue(undefined);
      const linking = await import("expo-linking");
      vi.mocked(linking.canOpenURL).mockImplementation(canOpenURL);
      vi.mocked(linking.openURL).mockImplementation(openURL);

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(canOpenURL).toHaveBeenCalledWith(
        expect.stringContaining("whatsapp://send?text="),
      );
      expect(openURL).toHaveBeenCalledWith(expect.stringContaining("whatsapp://send?text="));
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });

    it("recorre ao menu nativo quando o WhatsApp não está instalado", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "android";
      const linking = await import("expo-linking");
      vi.mocked(linking.canOpenURL).mockResolvedValue(false);
      const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(shareSpy).toHaveBeenCalledWith({
        message: expect.stringContaining("Dom Casmurro"),
      });
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });

    it("usa a Web Share API quando disponível", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "web";
      const webShare = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", { share: webShare, clipboard: { writeText: vi.fn() } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(webShare).toHaveBeenCalledWith({
        text: expect.stringContaining("Dom Casmurro"),
        url: "https://ipebook.app/livro/b1",
      });
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
      Platform.OS = originalOS;
    });

    it("não mostra erro quando a pessoa cancela o menu de compartilhamento", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "web";
      const cancel = Object.assign(new Error("Share canceled"), { name: "AbortError" });
      vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue(cancel), clipboard: { writeText: vi.fn() } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });

    it("copia a mensagem quando o navegador recusa a Web Share API", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "web";
      const denied = Object.assign(new Error("Permission denied"), { name: "NotAllowedError" });
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue(denied), clipboard: { writeText } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Dom Casmurro"));
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
      Platform.OS = originalOS;
    });

    it("copia a mensagem quando a Web Share API não está disponível", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "web";
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal("navigator", { clipboard: { writeText } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Dom Casmurro"));
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
      Platform.OS = originalOS;
    });
  });
});

describe("useShareListingViewModel — imagem do anúncio (Spec 092)", () => {
  it("captura a imagem e abre a folha de compartilhamento com o arquivo", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareFile = vi.fn().mockResolvedValue(true);
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, shareFile);
    const capture = vi.fn().mockResolvedValue("file:///tmp/anuncio.png");
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, capture); });
    expect(shareFile).toHaveBeenCalledWith("file:///tmp/anuncio.png", "Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1", "Compartilhar anúncio");
    expect(shareSpy).not.toHaveBeenCalled();
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("cai no texto com link https quando o aparelho não compartilha arquivos", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, vi.fn().mockResolvedValue(false));
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, vi.fn().mockResolvedValue("file:///x.png")); });
    expect(shareSpy).toHaveBeenCalledWith({ message: "Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1" });
    Platform.OS = originalOS;
  });

  it("na web copia o texto com o link, sem capturar", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const capture = vi.fn();
    const hook = await renderHook(fakeUseCases, vi.fn());
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, capture); });
    expect(capture).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1");
    expect(hook.current[0].linkCopied).toBe(true);
    Platform.OS = originalOS;
  });

  it("mostra erro amigável quando a captura falha ou o anúncio é inválido", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const hook = await renderHook(fakeUseCases, vi.fn().mockResolvedValue(true));
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, vi.fn().mockRejectedValue(new Error("x"))); });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o anúncio. Tente novamente.");
    const invalid = await renderHook({ ...fakeUseCases, buildListingSharePath: () => { throw new ValidationError("Anúncio inválido."); } }, vi.fn());
    await act(async () => { await invalid.current[1].shareImage("", fakeListing, vi.fn()); });
    expect(invalid.current[0].error).toBe("Anúncio inválido.");
    Platform.OS = originalOS;
  });
});

