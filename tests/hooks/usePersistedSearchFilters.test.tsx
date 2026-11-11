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
  SEARCH_FILTERS_STORAGE_KEY,
  usePersistedSearchFilters,
} from "@/viewmodel/usePersistedSearchFilters";
import { DEFAULT_SEARCH_FILTERS } from "@/viewmodel/searchFilters";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook() {
  let result!: ReturnType<typeof usePersistedSearchFilters>;
  function HookProbe() {
    result = usePersistedSearchFilters();
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

describe("testes de hook: usePersistedSearchFilters", () => {
  beforeEach(() => {
    store.clear();
  });

  afterEach(async () => {
    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });
  });

  it("retorna null e loaded=true quando o storage está vazio", async () => {
    const hook = await renderHook();
    expect(hook.current.loaded).toBe(true);
    expect(hook.current.persisted).toBeNull();
  });

  it("carrega filtros e ordenação persistidos anteriormente", async () => {
    store.set(
      SEARCH_FILTERS_STORAGE_KEY,
      JSON.stringify({
        filters: { ...DEFAULT_SEARCH_FILTERS, modality: "trade", category: "Literatura" },
        sortBy: "price_asc",
      }),
    );
    const hook = await renderHook();
    expect(hook.current.loaded).toBe(true);
    expect(hook.current.persisted?.filters.modality).toBe("trade");
    expect(hook.current.persisted?.filters.category).toBe("Literatura");
    expect(hook.current.persisted?.sortBy).toBe("price_asc");
  });

  it("grava filtros e ordenação via persist()", async () => {
    const hook = await renderHook();
    await act(async () => {
      hook.current.persist({ ...DEFAULT_SEARCH_FILTERS, modality: "sale" }, "title_asc");
    });
    const saved = store.get(SEARCH_FILTERS_STORAGE_KEY);
    expect(saved).toBeDefined();
    const parsed = JSON.parse(saved as string);
    expect(parsed.filters.modality).toBe("sale");
    expect(parsed.sortBy).toBe("title_asc");
  });

  it("recupera-se graciosamente quando o conteúdo no storage for inválido", async () => {
    store.set(SEARCH_FILTERS_STORAGE_KEY, "invalido{json");
    const hook = await renderHook();
    expect(hook.current.loaded).toBe(true);
    expect(hook.current.persisted).toBeNull();
  });
});
