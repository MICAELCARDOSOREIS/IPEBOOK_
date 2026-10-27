import { createElement } from "react";
import { Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";

vi.mock("expo-linking", () => ({
  createURL: vi.fn((path: string) => `https://ipebook.app${path}`),
  canOpenURL: vi.fn().mockResolvedValue(false),
  openURL: vi.fn().mockResolvedValue(undefined),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const fakeUseCases: IShareUseCases = {
  buildListingSharePath: () => "/livro/1",
  buildShareMessage: () => "mensagem",
  buildWhatsAppShareUrl: (msg) => `whatsapp://send?text=${encodeURIComponent(msg)}`,
  buildInviteMessage: (url = "https://ipebook.app") =>
    `Venha para o IpêBook em Piripiri: ${url}`,
  buildWhatsAppInviteUrl: (url = "https://ipebook.app") =>
    `whatsapp://send?text=${encodeURIComponent(`Venha para o IpêBook em Piripiri: ${url}`)}`,
};

describe("useInviteFriendsViewModel (Spec 057, Figma 08.02)", () => {
  it("inicia com estado padrão e mensagem preenchida", async () => {
    const hook = await renderHook(fakeUseCases);
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].linkCopied).toBe(false);
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].inviteMessage).toContain("IpêBook");
  });

  it("abre o WhatsApp diretamente quando disponível no mobile", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    vi.mocked(Linking.canOpenURL).mockResolvedValue(true);
    const openUrlSpy = vi.mocked(Linking.openURL);

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });

    expect(openUrlSpy).toHaveBeenCalledWith(
      expect.stringContaining("whatsapp://send?text="),
    );
    expect(hook.current[0].sharing).toBe(false);
    Platform.OS = originalOS;
  });

  it("cai no fallback de Share nativo quando o WhatsApp não está instalado", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    vi.mocked(Linking.canOpenURL).mockResolvedValue(false);
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareToWhatsApp();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: expect.stringContaining("IpêBook em Piripiri"),
    });
    Platform.OS = originalOS;
  });

  it("compartilha via menu nativo em shareNative no mobile", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].shareNative();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      message: expect.stringContaining("IpêBook em Piripiri"),
    });
    Platform.OS = originalOS;
  });

  it("copia link e sinaliza feedback na Web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].copyLink();
    });

    expect(writeText).toHaveBeenCalledWith("https://ipebook.app");
    expect(hook.current[0].linkCopied).toBe(true);

    act(() => {
      hook.current[1].dismissLinkCopied();
    });
    expect(hook.current[0].linkCopied).toBe(false);
    Platform.OS = originalOS;
  });
});

describe("useInviteFriendsViewModel — imagem do convite (Spec 092)", () => {
  it("captura a imagem e abre a folha de compartilhamento com o arquivo", async () => {
    vi.spyOn(Platform, "OS", "get").mockReturnValue("android");
    const shareFile = vi.fn().mockResolvedValue(true);
    const share = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, undefined, shareFile);
    const capture = vi.fn().mockResolvedValue("file:///tmp/convite.png");
    await act(async () => { await hook.current[1].shareImage(capture); });
    expect(capture).toHaveBeenCalledTimes(1);
    expect(shareFile).toHaveBeenCalledWith("file:///tmp/convite.png");
    expect(share).not.toHaveBeenCalled();
    expect(hook.current[0].sharing).toBe(false);
    expect(hook.current[0].error).toBeNull();
  });

  it("cai no texto com link quando o aparelho não compartilha arquivos", async () => {
    vi.spyOn(Platform, "OS", "get").mockReturnValue("android");
    const share = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const hook = await renderHook(fakeUseCases, undefined, vi.fn().mockResolvedValue(false));
    await act(async () => { await hook.current[1].shareImage(vi.fn().mockResolvedValue("file:///x.png")); });
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining("IpêBook") });
  });

  it("na web compartilha só o texto, sem capturar", async () => {
    vi.spyOn(Platform, "OS", "get").mockReturnValue("web");
    const share = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction", activityType: undefined });
    const capture = vi.fn();
    const hook = await renderHook(fakeUseCases, undefined, vi.fn());
    await act(async () => { await hook.current[1].shareImage(capture); });
    expect(capture).not.toHaveBeenCalled();
    expect(share).toHaveBeenCalledTimes(1);
  });

  it("mostra erro amigável quando a captura falha e ignora segundo toque em andamento", async () => {
    vi.spyOn(Platform, "OS", "get").mockReturnValue("android");
    const hook = await renderHook(fakeUseCases, undefined, vi.fn().mockResolvedValue(true));
    await act(async () => { await hook.current[1].shareImage(vi.fn().mockRejectedValue(new Error("falhou"))); });
    expect(hook.current[0].error).toBe("Não foi possível compartilhar o convite. Tente novamente.");

    let release!: (uri: string) => void;
    const slow = vi.fn().mockReturnValue(new Promise<string>((resolve) => { release = resolve; }));
    const shareFile = vi.fn().mockResolvedValue(true);
    const second = await renderHook(fakeUseCases, undefined, shareFile);
    await act(async () => {
      void second.current[1].shareImage(slow);
      void second.current[1].shareImage(slow);
    });
    expect(slow).toHaveBeenCalledTimes(1);
    await act(async () => { release("file:///a.png"); });
    expect(shareFile).toHaveBeenCalledTimes(1);
  });
});

