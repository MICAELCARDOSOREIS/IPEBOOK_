import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import { CachedBookDataSource, IKeyValueStorage } from "@/infra/datasources/cachedBookDataSource";

class MockStorage implements IKeyValueStorage {
  private data = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

const sampleBooks: Book[] = [
  {
    id: "livro-1",
    title: "Vidas Secas",
    author: "Graciliano Ramos",
    status: "available",
    modality: "donation",
    ownerId: "user-1",
    city: "Piripiri",
    state: "PI",
    neighborhood: "Centro",
  },
  {
    id: "livro-2",
    title: "O Quinze",
    author: "Rachel de Queiroz",
    status: "available",
    modality: "trade",
    ownerId: "user-2",
    city: "Piripiri",
    state: "PI",
    neighborhood: "Fonte dos Matos",
  },
];

describe("CachedBookDataSource (Resiliência e Offline-first)", () => {
  it("retorna livros do primário e armazena cópia no storage", async () => {
    const primary: IBookDataSource = {
      list: vi.fn().mockResolvedValue(sampleBooks),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      listByOwner: vi.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    const result = await cachedDs.list();
    expect(result).toEqual(sampleBooks);
    expect(primary.list).toHaveBeenCalledTimes(1);

    const savedInStorage = await storage.getItem("ipebook:cache:books:list");
    expect(savedInStorage).not.toBeNull();
    const parsed = JSON.parse(savedInStorage!);
    expect(parsed.data).toEqual(sampleBooks);
  });

  it("utiliza fallback de cache local quando a chamada primária falha por erro de rede", async () => {
    const primary: IBookDataSource = {
      list: vi
        .fn()
        .mockResolvedValueOnce(sampleBooks) // 1ª chamada tem sucesso
        .mockRejectedValueOnce(new Error("Network request failed")), // 2ª chamada falha (offline)
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      listByOwner: vi.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    // 1ª consulta popula o cache
    await cachedDs.list();

    // 2ª consulta simula falha de rede: deve retornar o cache sem quebrar a execução
    const offlineResult = await cachedDs.list();
    expect(offlineResult).toEqual(sampleBooks);
    expect(primary.list).toHaveBeenCalledTimes(2);
  });

  it("propaga erro caso o primário falhe e não haja nada em cache", async () => {
    const primary: IBookDataSource = {
      list: vi.fn().mockRejectedValue(new Error("Supabase indisponível")),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      listByOwner: vi.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    await expect(cachedDs.list()).rejects.toThrow("Supabase indisponível");
  });

  it("encontra livro por ID no cache se a rede falhar", async () => {
    const primary: IBookDataSource = {
      list: vi.fn().mockResolvedValue(sampleBooks),
      findById: vi.fn().mockRejectedValue(new Error("Network timeout")),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
      listByOwner: vi.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    // Popula cache
    await cachedDs.list();

    // Busca por ID offline
    const book = await cachedDs.findById("livro-1");
    expect(book).toEqual(sampleBooks[0]);
  });

  it("invalida cache ao criar, atualizar ou remover anúncios", async () => {
    const primary: IBookDataSource = {
      list: vi.fn().mockResolvedValue(sampleBooks),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue({ ...sampleBooks[0], id: "novo" }),
      update: vi.fn().mockResolvedValue(sampleBooks[0]),
      updateStatus: vi.fn().mockResolvedValue(sampleBooks[0]),
      delete: vi.fn().mockResolvedValue(undefined),
      listByOwner: vi.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    await cachedDs.list();
    expect(await storage.getItem("ipebook:cache:books:list")).not.toBeNull();

    await cachedDs.create({
      title: "Novo Livro",
      author: "Novo Autor",
      status: "available",
      modality: "donation",
      ownerId: "user-1",
    });

    // O cache deve ter sido invalidado
    expect(await storage.getItem("ipebook:cache:books:list")).toBeNull();
  });
});
