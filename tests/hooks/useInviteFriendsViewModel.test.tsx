import { createElement } from "react";
import { Clipboard, Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import * as Linking from "expo-linking";
import { DomainError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `https://ipebook.app${path}`),
  openURL: jest.fn().mockResolvedValue(undefined),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
const originalPlatformOS = Platform.OS;

async function renderHook(useCases: IShareUseCases, appUrl?: string, shareImageFile?: (uri: string) => Promise<boolean>) {
  let result!: ReturnType<typeof useInviteFriendsViewModel>;
  function HookProbe() {
    result = useInviteFriendsViewModel(useCases, appUrl, shareImageFile);
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
  buildListingSharePath: () => "/livro/1",
  buildShareMessage: () => "mensagem",
  buildWhatsAppShareMessage: () => "mensagem",
  buildWhatsAppShareUrl: (msg) => `whatsapp://send?text=${encodeURIComponent(msg)}`,
  buildInviteMessage: (url = "https://ipebook.app") =>
    `Venha para o IpêBook em Piripiri: ${url}`,
  buildWhatsAppInviteUrl: (url = "https://ipebook.app") =>
    `whatsapp://send?text=${encodeURIComponent(`Venha para o IpêBook em Piripiri: ${url}`)}`,
};

describe("useInviteFriendsViewModel (Spec 057, Figma 08.02)", () => {
  it("copia o link no iOS e confirma a cópia sem abrir a folha nativa", async () => {
    Platform.OS = "ios";
    const copy = jest.spyOn(Clipboard, "setString");
    const share = jest.spyOn(Share, "share");
    const hook = await renderHook(fakeUseCases, "https://ipebook.app");

    await act(async () => {
      await hook.current[1].copyLink();
    });

    expect(copy).toHaveBeenCalledWith("https://ipebook.app");
    expect(share).not.toHaveBeenCalled();
    expect(hook.current[0].linkCopied).toBe(true);
  });

  it("inicia com estado padrão e mensagem preenchida", async () => {
    const hook = await renderHook(fakeUseCases);
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].linkCopied).toBe(false);
    expect(hook.current[0].shared).toBe(false);
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].inviteMessage).toContain("IpêBook");
  });

  it("abre o WhatsApp diretamente quando disponível no mobile", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const openUrlSpy = jest.mocked(Linking.openURL);
    const shareSpy = jest.spyOn(Share, "share");

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });

    expect(openUrlSpy).toHaveBeenCalledWith(
      expect.stringContaining("whatsapp://send?text="),
    );
    expect(shareSpy).not.toHaveBeenCalled();
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].shared).toBe(true);
    expect(hook.current[0].linkCopied).toBe(false);
    Platform.OS = originalOS;
  });

  it("cai no fallback de Share nativo quando o WhatsApp não abre", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error("nenhum app abre whatsapp://"));
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: expect.stringContaining("IpêBook em Piripiri"),
    });
    expect(hook.current[0].shared).toBe(true);
    Platform.OS = originalOS;
  });

  it("compartilha via menu nativo em shareNative no mobile", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareNative();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: expect.stringContaining("IpêBook em Piripiri"),
    });
    expect(hook.current[0].shared).toBe(true);
    Platform.OS = originalOS;
  });

  it("copia link e sinaliza feedback na Web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].copyLink();
    });

    expect(writeText).toHaveBeenCalledWith("https://ipebook.app");
    expect(hook.current[0].linkCopied).toBe(true);
    expect(hook.current[0].shared).toBe(false);

    act(() => {
      hook.current[1].dismissLinkCopied();
    });
    expect(hook.current[0].linkCopied).toBe(false);
    Platform.OS = originalOS;
  });

  it("cobre fluxos web de shareToWhatsApp e shareNative com e sem navigator.share", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const navShare = jest.fn().mockResolvedValue(undefined);
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { share: navShare, clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });
    expect(navShare).toHaveBeenCalledWith({ text: expect.stringContaining("IpêBook em Piripiri") });
    expect(hook.current[0].shared).toBe(true);
    expect(hook.current[0].linkCopied).toBe(false);

    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(navShare).toHaveBeenCalledTimes(2);
    expect(hook.current[0].shared).toBe(true);

    act(() => {
      hook.current[1].dismissShared();
    });
    expect(hook.current[0].shared).toBe(false);

    // Sem navigator.share
    stubGlobal("navigator", { clipboard: { writeText } });
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });
    expect(writeText).toHaveBeenCalled();
    expect(hook.current[0].linkCopied).toBe(true);
    expect(hook.current[0].shared).toBe(false);

    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(writeText).toHaveBeenCalled();
    expect(hook.current[0].linkCopied).toBe(true);
    Platform.OS = originalOS;
  });

  it("cobre fallback e erros em copyLink e shareNative no mobile", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].copyLink();
    });
    expect(shareSpy).toHaveBeenCalledWith({ message: "https://ipebook.app" });
    expect(hook.current[0].shared).toBe(true);
    expect(hook.current[0].linkCopied).toBe(false);

    // Erros em shareNative e copyLink
    shareSpy.mockRejectedValueOnce(new Error("Falha no share"));
    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");

    shareSpy.mockRejectedValueOnce(new Error("Falha no copy"));
    await act(async () => {
      await hook.current[1].copyLink();
    });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");

    // Erro em shareToWhatsApp
    jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error("sem WhatsApp"));
    shareSpy.mockRejectedValueOnce(new Error("Falha no share"));
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");
    Platform.OS = originalOS;
  });

  it("trata cancelamento e falta de permissão da Web Share API no convite", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const abort = Object.assign(new Error("cancelado"), { name: "AbortError" });
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(abort), clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });

    // Fechar o menu do navegador encerra sem erro e sem copiar nada.
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].shared).toBe(false);
    expect(hook.current[0].linkCopied).toBe(false);
    expect(writeText).not.toHaveBeenCalled();

    const denied = Object.assign(new Error("sem permissão"), { name: "NotAllowedError" });
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(denied), clipboard: { writeText } });
    await act(async () => {
      await hook.current[1].shareNative();
    });

    // Sem permissão, o convite vai para a área de transferência com aviso.
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("IpêBook em Piripiri"));
    expect(hook.current[0].linkCopied).toBe(true);
    expect(hook.current[0].shared).toBe(false);
    Platform.OS = originalOS;
  });
});

describe("useInviteFriendsViewModel — imagem do convite (Spec 092)", () => {
  it("captura a imagem e abre a folha de compartilhamento com o arquivo", async () => {
    Platform.OS = "android";
    const shareFile = jest.fn().mockResolvedValue(true);
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, undefined, shareFile);
    const capture = jest.fn().mockResolvedValue("file:///tmp/convite.png");
    await act(async () => { await hook.current[1].shareImage(capture); });
    expect(capture).toHaveBeenCalledTimes(1);
    expect(shareFile).toHaveBeenCalledWith("file:///tmp/convite.png", expect.stringContaining("IpêBook"), "Convidar amigos para o IpêBook");
    expect(share).not.toHaveBeenCalled();
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].shared).toBe(true);
    expect(hook.current[0].error).toBeNull();
  });

  it("cai no texto com link quando o aparelho não compartilha arquivos", async () => {
    Platform.OS = "android";
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, undefined, jest.fn().mockResolvedValue(false));
    await act(async () => { await hook.current[1].shareImage(jest.fn().mockResolvedValue("file:///x.png")); });
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining("IpêBook") });
    expect(hook.current[0].shared).toBe(true);
  });

  it("na web copia o texto com o link, sem capturar", async () => {
    Platform.OS = "web";
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubGlobal("navigator", { clipboard: { writeText } });
    const capture = jest.fn();
    const hook = await renderHook(fakeUseCases, undefined, jest.fn());
    await act(async () => { await hook.current[1].shareImage(capture); });
    expect(capture).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("IpêBook"));
    expect(hook.current[0].linkCopied).toBe(true);
    expect(hook.current[0].shared).toBe(false);
  });

  it("mostra erro amigável quando a captura falha e ignora segundo toque em andamento", async () => {
    Platform.OS = "android";
    const hook = await renderHook(fakeUseCases, undefined, jest.fn().mockResolvedValue(true));
    await act(async () => { await hook.current[1].shareImage(jest.fn().mockRejectedValue(new Error("falhou"))); });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");

    let release!: (uri: string) => void;
    const slow = jest.fn().mockReturnValue(new Promise<string>((resolve) => { release = resolve; }));
    const shareFile = jest.fn().mockResolvedValue(true);
    const second = await renderHook(fakeUseCases, undefined, shareFile);
    await act(async () => {
      void second.current[1].shareImage(slow);
      void second.current[1].shareImage(slow);
    });
    expect(slow).toHaveBeenCalledTimes(1);
    await act(async () => { release("file:///a.png"); });
    expect(shareFile).toHaveBeenCalledTimes(1);
  });

  it("propaga DomainError nas ações de convite e permite limpar estado shared", async () => {
    Platform.OS = "android";
    const hook = await renderHook(fakeUseCases, undefined, jest.fn().mockResolvedValue(true));

    await act(async () => {
      await hook.current[1].shareImage(jest.fn().mockRejectedValue(new DomainError("Erro de captura.")));
    });
    expect(hook.current[0].error).toBe("Erro de captura.");

    jest.spyOn(Share, "share").mockRejectedValueOnce(new DomainError("Falha ao abrir folha."));
    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(hook.current[0].error).toBe("Falha ao abrir folha.");

    jest.spyOn(Share, "share").mockRejectedValueOnce(new DomainError("Sem permissão para copiar."));
    await act(async () => {
      await hook.current[1].copyLink();
    });
    expect(hook.current[0].error).toBe("Sem permissão para copiar.");

    jest.spyOn(Share, "share").mockResolvedValueOnce({ action: "sharedAction", activityType: undefined });
    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(hook.current[0].shared).toBe(true);

    act(() => {
      hook.current[1].dismissShared();
    });
    expect(hook.current[0].shared).toBe(false);
  });

  it("trata fallback NotAllowedError em shareToWhatsApp, AbortError em shareNative e erro inesperado na Web", async () => {
    Platform.OS = "web";
    const writeText = jest.fn().mockResolvedValue(undefined);
    const denied = Object.assign(new Error("negado"), { name: "NotAllowedError" });
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(denied), clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(hook.current[0].linkCopied).toBe(true);

    const abort = Object.assign(new Error("cancelado"), { name: "AbortError" });
    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(abort), clipboard: { writeText } });
    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(hook.current[0].error).toBeNull();

    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(new DomainError("Compartilhamento bloqueado.")), clipboard: { writeText } });
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });
    expect(hook.current[0].error).toBe("Compartilhamento bloqueado.");

    stubGlobal("navigator", { share: jest.fn().mockRejectedValue(new Error("erro desconhecido")), clipboard: { writeText } });
    await act(async () => {
      await hook.current[1].shareNative();
    });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");

    stubGlobal("navigator", { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("clipboard indisponível")) } });
    await act(async () => {
      await hook.current[1].copyLink();
    });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");
  });

  it("não atualiza estado após desmontar durante ação assíncrona", async () => {
    Platform.OS = "web";
    let resolveCopy!: () => void;
    stubGlobal("navigator", {
      clipboard: { writeText: jest.fn().mockReturnValue(new Promise<void>((r) => { resolveCopy = r; })) },
    });
    const hook = await renderHook(fakeUseCases);
    const pending = hook.current[1].copyLink();
    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });
    await act(async () => {
      resolveCopy();
      await pending;
    });
    expect(hook.current[0].linkCopied).toBe(false);
  });
});

