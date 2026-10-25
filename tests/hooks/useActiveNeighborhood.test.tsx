import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  },
}));

import {
  ACTIVE_NEIGHBORHOOD_STORAGE_KEY,
  useActiveNeighborhood,
} from "@/viewmodel/useActiveNeighborhood";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderActiveNeighborhoodHook(defaultNeighborhood = "Centro") {
  let result!: ReturnType<typeof useActiveNeighborhood>;
  function HookProbe() {
    result = useActiveNeighborhood(defaultNeighborhood);
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

describe("testes de hook: useActiveNeighborhood (Spec 067 / ADR 0050)", () => {
  beforeEach(() => {
    store.clear();
  });

  afterEach(async () => {
    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });
  });

  it("inicia com o bairro padrão quando nada foi salvo", async () => {
    const hook = await renderActiveNeighborhoodHook("Centro");
    expect(hook.current.activeNeighborhood).toBe("Centro");
    expect(hook.current.isSelectorOpen).toBe(false);
  });

  it("carrega o bairro previamente salvo no AsyncStorage", async () => {
    store.set(ACTIVE_NEIGHBORHOOD_STORAGE_KEY, "Petecas");
    const hook = await renderActiveNeighborhoodHook("Centro");
    expect(hook.current.activeNeighborhood).toBe("Petecas");
  });

  it("atualiza o bairro e persiste no AsyncStorage", async () => {
    const hook = await renderActiveNeighborhoodHook("Centro");
    await act(async () => {
      await hook.current.selectNeighborhood("Paciência");
    });
    expect(hook.current.activeNeighborhood).toBe("Paciência");
    expect(store.get(ACTIVE_NEIGHBORHOOD_STORAGE_KEY)).toBe("Paciência");
  });

  it("controla a abertura e fechamento do seletor", async () => {
    const hook = await renderActiveNeighborhoodHook("Centro");
    expect(hook.current.isSelectorOpen).toBe(false);

    act(() => {
      hook.current.openSelector();
    });
    expect(hook.current.isSelectorOpen).toBe(true);

    act(() => {
      hook.current.closeSelector();
    });
    expect(hook.current.isSelectorOpen).toBe(false);
  });
});
