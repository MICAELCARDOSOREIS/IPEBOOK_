import { createElement } from "react";
import { Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";

vi.mock("expo-linking", () => ({
  createURL: vi.fn((path: string) => `https://ipebook.pages.dev${path}`),
  canOpenURL: vi.fn().mockResolvedValue(false),
  openURL: vi.fn().mockResolvedValue(undefined),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: IShareUseCases, appUrl?: string) {
  let result!: ReturnType<typeof useInviteFriendsViewModel>;
  function HookProbe() {
    result = useInviteFriendsViewModel(useCases, appUrl);
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
  buildInviteMessage: (url = "https://ipebook.pages.dev") =>
    `Venha para o IpêBook em Piripiri: ${url}`,
  buildWhatsAppInviteUrl: (url = "https://ipebook.pages.dev") =>
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
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });

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
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });

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

    expect(writeText).toHaveBeenCalledWith("https://ipebook.pages.dev");
    expect(hook.current[0].linkCopied).toBe(true);

    act(() => {
      hook.current[1].dismissLinkCopied();
    });
    expect(hook.current[0].linkCopied).toBe(false);
    Platform.OS = originalOS;
  });
});
