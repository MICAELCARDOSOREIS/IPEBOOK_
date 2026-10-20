import { createElement } from "react";
import { Platform, Share } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";

vi.mock("expo-linking", () => ({ createURL: vi.fn((path: string) => `ipebook://${path}`) }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: IShareUseCases) {
  let result!: ReturnType<typeof useShareListingViewModel>;
  function HookProbe() {
    result = useShareListingViewModel(useCases);
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

const fakeUseCases: IShareUseCases = { buildListingSharePath: (bookId) => `/livro/${bookId}` };

describe("testes de hook: useShareListingViewModel (Spec 019)", () => {
  it("compartilha via menu nativo no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const shareSpy = vi.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    const hook = await renderHook(fakeUseCases);
    await act(async () => {
      await hook.current[1].share("b1");
    });
    expect(shareSpy).toHaveBeenCalledWith({ message: "ipebook:///livro/b1" });
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
    expect(writeText).toHaveBeenCalledWith("ipebook:///livro/b1");
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
    };
    const hook = await renderHook(useCases);
    await act(async () => {
      await hook.current[1].share("");
    });
    expect(hook.current[0]).toEqual({ sharing: false, linkCopied: false, error: "Anúncio inválido." });
  });
});
