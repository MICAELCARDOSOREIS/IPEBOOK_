
const mockStore = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  },
}));

import { AsyncStorageLocalCacheDataSource } from "@/infra/datasources/asyncStorageLocalCacheDataSource";
import { BOOKS_LIST_CACHE_KEY } from "@/infra/datasources/cachedBookDataSource";

describe("AsyncStorageLocalCacheDataSource — limpeza do catálogo offline (Spec 073)", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("remove apenas a chave do catálogo guardado pelo CachedBookDataSource", async () => {
    mockStore.set(BOOKS_LIST_CACHE_KEY, JSON.stringify({ timestamp: 1, data: [] }));
    mockStore.set("ipebook.preferenciaDeTema", "dark");

    const ds = new AsyncStorageLocalCacheDataSource();
    await ds.clearBooksCache();

    expect(mockStore.has(BOOKS_LIST_CACHE_KEY)).toBe(false);
    expect(mockStore.get("ipebook.preferenciaDeTema")).toBe("dark");
  });

  it("limpar sem nada guardado não falha", async () => {
    const ds = new AsyncStorageLocalCacheDataSource();
    await expect(ds.clearBooksCache()).resolves.toBeUndefined();
  });
});
