import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemorySearchHistoryDataSource } from "@/infra/datasources/memorySearchHistoryDataSource";
import { SearchHistoryUseCases } from "@/usecase/searchHistoryUseCases";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { storage.delete(key); }),
  },
}));

describe("caso de uso de histórico de buscas", () => {
  it("isola o histórico por conta e por convidado", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    await history.registerSearch("leitor", "Casmurro");
    await history.registerSearch(null, "Iracema");
    expect(await history.listTerms("leitor")).toEqual(["Casmurro"]);
    expect(await history.listTerms(null)).toEqual(["Iracema"]);
    expect(await history.listTerms("outra-conta")).toEqual([]);
  });

  it("ignora termo vazio, deduplica subindo ao topo e limita a 10 itens", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    await history.registerSearch("leitor", "  ");
    expect(await history.listTerms("leitor")).toEqual([]);
    for (let i = 0; i < 10; i += 1) await history.registerSearch("leitor", `termo-${i}`);
    await history.registerSearch("leitor", "termo-extra");
    const terms = await history.listTerms("leitor");
    expect(terms).toHaveLength(10);
    expect(terms[0]).toBe("termo-extra");
    expect(terms).not.toContain("termo-0");
    await history.registerSearch("leitor", "termo-5");
    expect((await history.listTerms("leitor"))[0]).toBe("termo-5");
  });

  it("limpa somente o histórico da conta informada", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    await history.registerSearch("leitor", "Casmurro");
    await history.registerSearch("outra-conta", "Iracema");
    await history.clearHistory("leitor");
    expect(await history.listTerms("leitor")).toEqual([]);
    expect(await history.listTerms("outra-conta")).toEqual(["Iracema"]);
  });
});

describe("persistência em AsyncStorage do histórico de buscas", () => {
  beforeEach(() => storage.clear());

  it("persiste, deduplica e limita por chave isolada de conta", async () => {
    const { AsyncStorageSearchHistoryDataSource } = await import("@/infra/datasources/asyncStorageSearchHistoryDataSource");
    const source = new AsyncStorageSearchHistoryDataSource();
    expect(await source.list("leitor")).toEqual([]);
    await source.add("leitor", "Casmurro");
    await source.add("leitor", "Iracema");
    await source.add("leitor", "Casmurro");
    expect(await source.list("leitor")).toEqual(["Casmurro", "Iracema"]);
    expect(await source.list("guest")).toEqual([]);
  });

  it("limpa a chave da conta sem afetar outra", async () => {
    const { AsyncStorageSearchHistoryDataSource } = await import("@/infra/datasources/asyncStorageSearchHistoryDataSource");
    const source = new AsyncStorageSearchHistoryDataSource();
    await source.add("leitor", "Casmurro");
    await source.add("guest", "Iracema");
    await source.clear("leitor");
    expect(await source.list("leitor")).toEqual([]);
    expect(await source.list("guest")).toEqual(["Iracema"]);
  });

  it("ignora conteúdo corrompido na chave de armazenamento", async () => {
    const { AsyncStorageSearchHistoryDataSource } = await import("@/infra/datasources/asyncStorageSearchHistoryDataSource");
    storage.set("search-history:leitor", "{json invalido");
    const source = new AsyncStorageSearchHistoryDataSource();
    expect(await source.list("leitor")).toEqual([]);
  });
});
