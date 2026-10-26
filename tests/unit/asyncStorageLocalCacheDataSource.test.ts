import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  },
}));

import { AsyncStorageLocalCacheDataSource } from "@/infra/datasources/asyncStorageLocalCacheDataSource";
import { BOOKS_LIST_CACHE_KEY } from "@/infra/datasources/cachedBookDataSource";

describe("AsyncStorageLocalCacheDataSource — limpeza do catálogo offline (Spec 073)", () => {
  beforeEach(() => {
    store.clear();
  });

  it("remove apenas a chave do catálogo guardado pelo CachedBookDataSource", async () => {
    store.set(BOOKS_LIST_CACHE_KEY, JSON.stringify({ timestamp: 1, data: [] }));
    store.set("ipebook.preferenciaDeTema", "dark");

    const ds = new AsyncStorageLocalCacheDataSource();
    await ds.clearBooksCache();

    expect(store.has(BOOKS_LIST_CACHE_KEY)).toBe(false);
    expect(store.get("ipebook.preferenciaDeTema")).toBe("dark");
  });

  it("limpar sem nada guardado não falha", async () => {
    const ds = new AsyncStorageLocalCacheDataSource();
    await expect(ds.clearBooksCache()).resolves.toBeUndefined();
  });
});
