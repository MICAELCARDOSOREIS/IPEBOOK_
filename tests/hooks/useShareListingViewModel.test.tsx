import { createElement } from "react";
import { Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ValidationError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `ipebook://${path}`),
  openURL: jest.fn().mockResolvedValue(undefined),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
const originalPlatformOS = Platform.OS;

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
  Platform.OS = originalPlatformOS;
  jest.restoreAllMocks();
  unstubAllGlobals();
});

const fakeUseCases: IShareUseCases = {
  buildListingSharePath: (bookId) => `/livro/${bookId}`,
  buildShareMessage: (listing, url) => `${listing.title} de ${listing.author} — ${url}`,
  buildWhatsAppShareMessage: (listing, url) => `${listing.title} de ${listing.author} — ${url}`,
  buildWhatsAppShareUrl: (message) => `whatsapp://send?text=${encodeURIComponent(message)}`,
  buildInviteMessage: () => "",
  buildWhatsAppInviteUrl: () => "",
};

const fakeListing = { title: "Dom Casmurro", author: "Machado de Assis", modality: "trade" as const };

describe("testes de hook: useShareListingViewModel (Spec 019)", () => {
  it("compartilha via menu nativo no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
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
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { clipboard: { writeText } });
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
    stubGlobal("navigator", { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
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
      buildWhatsAppShareMessage: () => "",
      buildWhatsAppShareUrl: () => "",
      buildInviteMessage: () => "",
      buildWhatsAppInviteUrl: () => "",
    };
    const hook = await renderHook(useCases);
    await act(async () => {
      await hook.current[1].share("");
    });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: "Anúncio inválido." });

    // A tela pode fechar o aviso; repetir sem erro não altera o estado.
    act(() => {
      hook.current[1].dismissError();
    });
    expect(hook.current[0].error).toBeNull();
    act(() => {
      hook.current[1].dismissError();
    });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
  });

  describe("shareToWhatsApp (Issue #145)", () => {
    it("abre o WhatsApp sem consultar canOpenURL (indisponível no Android 11+ e no iOS)", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "android";
      const openURL = jest.fn().mockResolvedValue(undefined);
      const linking = await import("expo-linking");
      jest.mocked(linking.openURL).mockImplementation(openURL);
      const shareSpy = jest.spyOn(Share, "share");

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(openURL).toHaveBeenCalledWith(expect.stringContaining("whatsapp://send?text="));
      expect(shareSpy).not.toHaveBeenCalled();
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });

    it("recorre ao menu nativo quando o WhatsApp não abre", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "android";
      const linking = await import("expo-linking");
      jest.mocked(linking.openURL).mockRejectedValueOnce(new Error("nenhum app abre whatsapp://"));
      const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

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
      const webShare = jest.fn().mockResolvedValue(undefined);
      stubGlobal("navigator", { share: webShare, clipboard: { writeText: jest.fn() } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      // A mensagem já termina com o link: repetir `url` duplicaria o endereço no destino.
      expect(webShare).toHaveBeenCalledWith({ text: expect.stringContaining("Dom Casmurro") });
      // A folha do sistema é o próprio retorno; nada foi copiado.
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });

    it("não mostra erro quando a pessoa cancela o menu de compartilhamento", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "web";
      const cancel = Object.assign(new Error("Share canceled"), { name: "AbortError" });
      stubGlobal("navigator", { share: jest.fn().mockRejectedValue(cancel), clipboard: { writeText: jest.fn() } });

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
      const writeText = jest.fn().mockResolvedValue(undefined);
      stubGlobal("navigator", { share: jest.fn().mockRejectedValue(denied), clipboard: { writeText } });

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
      const writeText = jest.fn().mockResolvedValue(undefined);
      stubGlobal("navigator", { clipboard: { writeText } });

      const hook = await renderHook(fakeUseCases);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Dom Casmurro"));
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
      Platform.OS = originalOS;
    });

    it("abre só o WhatsApp, sem a folha de imagem do botão de compartilhar (Spec 118, ADR 0110)", async () => {
      const originalOS = Platform.OS;
      Platform.OS = "android";
      const shareFile = jest.fn().mockResolvedValue(true);
      const shareSpy = jest.spyOn(Share, "share");
      const linking = await import("expo-linking");
      const openURL = jest.fn().mockResolvedValue(undefined);
      jest.mocked(linking.openURL).mockImplementation(openURL);

      const hook = await renderHook(fakeUseCases, shareFile);
      await act(async () => {
        await hook.current[1].shareToWhatsApp("b1", fakeListing);
      });

      expect(openURL).toHaveBeenCalledWith(expect.stringContaining("whatsapp://send?text="));
      // Enviar a arte por ACTION_SEND abria a mesma folha do botão de compartilhar.
      expect(shareFile).not.toHaveBeenCalled();
      expect(shareSpy).not.toHaveBeenCalled();
      expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
      Platform.OS = originalOS;
    });
  });
});

describe("useShareListingViewModel — imagem do anúncio (Spec 092)", () => {
  it("captura a imagem e abre a folha de compartilhamento com o arquivo", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareFile = jest.fn().mockResolvedValue(true);
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, shareFile);
    const capture = jest.fn().mockResolvedValue("file:///tmp/anuncio.png");
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, capture); });
    expect(shareFile).toHaveBeenCalledWith("file:///tmp/anuncio.png", "Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1", "Compartilhar anúncio");
    expect(shareSpy).not.toHaveBeenCalled();
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("cai no texto com link https quando o aparelho não compartilha arquivos", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, jest.fn().mockResolvedValue(false));
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, jest.fn().mockResolvedValue("file:///x.png")); });
    expect(shareSpy).toHaveBeenCalledWith({ message: "Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1" });
    Platform.OS = originalOS;
  });

  it("na web copia o texto com o link, sem capturar", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { clipboard: { writeText } });
    const capture = jest.fn();
    const hook = await renderHook(fakeUseCases, jest.fn());
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, capture); });
    expect(capture).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("Dom Casmurro de Machado de Assis — https://ipebook.app/livro/b1");
    expect(hook.current[0].linkCopied).toBe(true);
    Platform.OS = originalOS;
  });

  it("mostra erro amigável quando a captura falha ou o anúncio é inválido", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const hook = await renderHook(fakeUseCases, jest.fn().mockResolvedValue(true));
    await act(async () => { await hook.current[1].shareImage("b1", fakeListing, jest.fn().mockRejectedValue(new Error("x"))); });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o anúncio. Tente novamente.");
    const invalid = await renderHook({ ...fakeUseCases, buildListingSharePath: () => { throw new ValidationError("Anúncio inválido."); } }, jest.fn());
    await act(async () => { await invalid.current[1].shareImage("", fakeListing, jest.fn()); });
    expect(invalid.current[0].error).toBe("Anúncio inválido.");
    Platform.OS = originalOS;
  });

  it("trata AbortError, NotAllowedError e dismissLinkCopied no shareToWhatsApp web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";

    // AbortError
    const abortErr = new Error("Abort");
    abortErr.name = "AbortError";
    const navAbort = jest.fn().mockRejectedValue(abortErr);
    stubGlobal("navigator", { share: navAbort });
    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].linkCopied).toBe(false);

    // NotAllowedError (recorre à área de transferência)
    const notAllowedErr = new Error("NotAllowed");
    notAllowedErr.name = "NotAllowedError";
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", {
      share: jest.fn().mockRejectedValue(notAllowedErr),
      clipboard: { writeText },
    });
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });
    expect(writeText).toHaveBeenCalled();
    expect(hook.current[0].linkCopied).toBe(true);

    // dismissLinkCopied
    act(() => {
      hook.current[1].dismissLinkCopied();
    });
    expect(hook.current[0].linkCopied).toBe(false);

    Platform.OS = originalOS;
  });
});

describe("useShareListingViewModel — branches de share com anúncio (Spec 118)", () => {
  it("usa a Web Share API ao compartilhar anúncio na web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const webShare = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { share: webShare, clipboard: { writeText: jest.fn() } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1", fakeListing);
    });

    expect(webShare).toHaveBeenCalledWith({ text: expect.stringContaining("Dom Casmurro") });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("encerra sem erro quando a pessoa cancela a Web Share API", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const cancel = Object.assign(new Error("cancelado"), { name: "AbortError" });
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(cancel) });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1", fakeListing);
    });

    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("copia o texto quando a Web Share API é recusada por permissão", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const denied = Object.assign(new Error("sem permissão"), { name: "NotAllowedError" });
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(denied), clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1", fakeListing);
    });

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Dom Casmurro"));
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: true, error: null });
    Platform.OS = originalOS;
  });

  it("mostra erro genérico quando a Web Share API falha por outro motivo", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(new Error("falha inesperada")) });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1", fakeListing);
    });

    expect(hook.current[0].error).toBe("Não foi possível compartilhar o anúncio. Tente novamente.");
    Platform.OS = originalOS;
  });

  it("compartilha a imagem capturada no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareFile = jest.fn().mockResolvedValue(true);
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, shareFile);
    const capture = jest.fn().mockResolvedValue("file:///tmp/anuncio.png");

    await act(async () => {
      await hook.current[1].share("b1", fakeListing, capture);
    });

    expect(shareFile).toHaveBeenCalledWith(
      "file:///tmp/anuncio.png",
      expect.stringContaining("Dom Casmurro"),
      "Compartilhar anúncio",
    );
    expect(shareSpy).not.toHaveBeenCalled();
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: null });
    Platform.OS = originalOS;
  });

  it("cai no compartilhamento de texto quando a captura falha no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, jest.fn().mockResolvedValue(true));

    await act(async () => {
      await hook.current[1].share("b1", fakeListing, jest.fn().mockRejectedValue(new Error("captura falhou")));
    });

    expect(shareSpy).toHaveBeenCalledWith({ message: expect.stringContaining("Dom Casmurro") });
    expect(hook.current[0].error).toBeNull();
    Platform.OS = originalOS;
  });

  it("cai no compartilhamento de texto quando o arquivo não é compartilhado", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, jest.fn().mockResolvedValue(false));

    await act(async () => {
      await hook.current[1].share("b1", fakeListing, jest.fn().mockResolvedValue("file:///tmp/anuncio.png"));
    });

    expect(shareSpy).toHaveBeenCalledWith({ message: expect.stringContaining("Dom Casmurro") });
    Platform.OS = originalOS;
  });
});

describe("useShareListingViewModel — fallback sem formatação de WhatsApp", () => {
  const semFormatacao = {
    ...fakeUseCases,
    buildWhatsAppShareMessage: undefined,
  } as unknown as IShareUseCases;

  it("usa a mensagem genérica ao compartilhar anúncio", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(semFormatacao);

    await act(async () => {
      await hook.current[1].share("b1", fakeListing);
    });

    expect(shareSpy).toHaveBeenCalledWith({ message: expect.stringContaining("Dom Casmurro") });
    Platform.OS = originalOS;
  });

  it("usa a mensagem genérica ao compartilhar no WhatsApp", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const linking = await import("expo-linking");
    jest.mocked(linking.openURL).mockRejectedValueOnce(new Error("sem WhatsApp"));
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(semFormatacao);

    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });

    expect(shareSpy).toHaveBeenCalledWith({ message: expect.stringContaining("Dom Casmurro") });
    Platform.OS = originalOS;
  });

  it("mostra erro genérico quando a Web Share API falha no WhatsApp", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(new Error("falha inesperada")) });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });

    expect(hook.current[0].error).toBe("Não foi possível compartilhar o anúncio. Tente novamente.");
    Platform.OS = originalOS;
  });
});

describe("useShareListingViewModel — abertura do WhatsApp na web", () => {
  it("abre o WhatsApp em nova aba quando disponível", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const open = jest.fn().mockReturnValue({});
    stubGlobal("navigator", {});
    stubGlobal("window", { open });
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });

    expect(open).toHaveBeenCalledWith(expect.stringContaining("whatsapp://send?text="), "_blank", "noopener,noreferrer");
    expect(hook.current[0].linkCopied).toBe(true);
    Platform.OS = originalOS;
  });

  it("usa Linking.openURL quando a janela não é aberta", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const linking = await import("expo-linking");
    const openURL = jest.fn().mockResolvedValue(undefined);
    jest.mocked(linking.openURL).mockImplementation(openURL);
    stubGlobal("navigator", {});
    stubGlobal("window", { open: jest.fn().mockReturnValue(null) });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });

    expect(openURL).toHaveBeenCalledWith(expect.stringContaining("whatsapp://send?text="));
    Platform.OS = originalOS;
  });

  it("segue para o WhatsApp quando window.open lança exceção", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const linking = await import("expo-linking");
    const openURL = jest.fn().mockResolvedValue(undefined);
    jest.mocked(linking.openURL).mockImplementation(openURL);
    stubGlobal("navigator", {});
    stubGlobal("window", {
      open: jest.fn(() => {
        throw new Error("bloqueado");
      }),
    });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp("b1", fakeListing);
    });

    expect(openURL).toHaveBeenCalled();
    expect(hook.current[0].error).toBeNull();
    Platform.OS = originalOS;
  });
});

