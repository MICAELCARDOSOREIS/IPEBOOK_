import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: ILocalCacheUseCases) {
  let result!: ReturnType<typeof useSettingsViewModel>;
  function HookProbe() {
    result = useSettingsViewModel(useCases);
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
});

describe("useSettingsViewModel — Configurações (Spec 073)", () => {
  it("começa ocioso e confirma a limpeza após o use case executar", async () => {
    const clearBooksCache = vi.fn().mockResolvedValue(undefined);
    const hook = await renderHook({ clearBooksCache });

    expect(hook.current[0].clearingCache).toBe(false);
    expect(hook.current[0].cacheCleared).toBe(false);
    expect(hook.current[0].cacheError).toBeNull();

    await act(async () => {
      await hook.current[1].clearBooksCache();
    });

    expect(clearBooksCache).toHaveBeenCalledTimes(1);
    expect(hook.current[0].clearingCache).toBe(false);
    expect(hook.current[0].cacheCleared).toBe(true);
    expect(hook.current[0].cacheError).toBeNull();
  });

  it("mostra erro amigável e mantém a tela utilizável quando a limpeza falha", async () => {
    const clearBooksCache = vi.fn().mockRejectedValue(new Error("storage indisponível"));
    const hook = await renderHook({ clearBooksCache });

    await act(async () => {
      await hook.current[1].clearBooksCache();
    });

    expect(hook.current[0].clearingCache).toBe(false);
    expect(hook.current[0].cacheCleared).toBe(false);
    expect(hook.current[0].cacheError).toBe("Não foi possível limpar os dados salvos. Tente novamente.");
    expect(hook.current[0].cacheError).not.toContain("storage indisponível");
  });
});

describe("useSettingsViewModel — histórico de buscas (Spec 091)", () => {
  async function renderWithHistory(clearHistory: () => Promise<void>) {
    let result!: ReturnType<typeof useSettingsViewModel>;
    function Probe() {
      result = useSettingsViewModel(
        { clearBooksCache: vi.fn() },
        { listTerms: vi.fn(), registerSearch: vi.fn(), clearHistory } as never,
      );
      return null;
    }
    await act(async () => { mounted.push(create(createElement(Probe))); });
    return { get current() { return result; } };
  }

  it("apaga o histórico e confirma", async () => {
    const clearHistory = vi.fn().mockResolvedValue(undefined);
    const hook = await renderWithHistory(clearHistory);
    await act(async () => { await hook.current[1].clearSearchHistory("ana"); });
    expect(clearHistory).toHaveBeenCalledWith("ana");
    expect(hook.current[0].historyCleared).toBe(true);
    expect(hook.current[0].historyError).toBeNull();
  });

  it("mostra erro amigável quando apagar falha", async () => {
    const hook = await renderWithHistory(vi.fn().mockRejectedValue(new Error("x")));
    await act(async () => { await hook.current[1].clearSearchHistory(null); });
    expect(hook.current[0].historyCleared).toBe(false);
    expect(hook.current[0].historyError).toBe("Não foi possível limpar o histórico de buscas. Tente novamente.");
  });
});
