import type { Book } from "@/model/entities/book";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import { CachedBookDataSource, type IKeyValueStorage } from "@/infra/datasources/cachedBookDataSource";

class MockStorage implements IKeyValueStorage {
  private data = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async getAllKeys(): Promise<string[]> {
    return [...this.data.keys()];
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
      list: jest.fn().mockResolvedValue(sampleBooks),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    const result = await cachedDs.list();
    expect(result).toEqual(sampleBooks);
    expect(primary.list).toHaveBeenCalledTimes(1);

    const savedInStorage = await storage.getItem("ipebook:cache:books:list");
    expect(savedInStorage).not.toBeNull();
    const parsed = JSON.parse(savedInStorage ?? "");
    expect(parsed.data).toEqual(sampleBooks);
  });

  it("utiliza fallback de cache local quando a chamada primária falha por erro de rede", async () => {
    const primary: IBookDataSource = {
      list: jest
        .fn()
        .mockResolvedValueOnce(sampleBooks) // 1ª chamada tem sucesso
        .mockRejectedValueOnce(new Error("Network request failed")), // 2ª chamada falha (offline)
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn(),
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
      list: jest.fn().mockRejectedValue(new Error("Supabase indisponível")),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    await expect(cachedDs.list()).rejects.toThrow("Supabase indisponível");
  });

  it("reabre a última cópia após cinco minutos sem alterar sua data", async () => {
    const primary: IBookDataSource = {
      list: jest.fn().mockRejectedValue(new Error("Supabase indisponível")),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn(),
    };
    const storage = new MockStorage();
    const timestamp = Date.now() - 360_000;
    await storage.setItem("ipebook:cache:books:list", JSON.stringify({ timestamp, data: sampleBooks }));
    const cachedDs = new CachedBookDataSource(primary, { storage });

    await expect(cachedDs.readCatalog()).resolves.toEqual({ data: sampleBooks, cachedAt: timestamp });
    await expect(cachedDs.list()).resolves.toEqual(sampleBooks);
    expect(await storage.getItem("ipebook:cache:books:list")).toContain(String(timestamp));
  });

  it("substitui a cópia só após reconectar e conserva uma resposta vazia válida", async () => {
    const list = jest.fn().mockResolvedValueOnce(sampleBooks).mockRejectedValueOnce(new Error("Sem rede"))
      .mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("Sem rede"));
    const source = new CachedBookDataSource({ list } as unknown as IBookDataSource, { storage: new MockStorage() });

    await expect(source.readCatalog()).resolves.toEqual({ data: sampleBooks, cachedAt: null });
    await expect(source.readCatalog()).resolves.toEqual({ data: sampleBooks, cachedAt: expect.any(Number) });
    await expect(source.readCatalog()).resolves.toEqual({ data: [], cachedAt: null });
    await expect(source.readCatalog()).resolves.toEqual({ data: [], cachedAt: expect.any(Number) });
  });

  it("isola a Estante por conta após reiniciar e remove cópias ao limpar", async () => {
    const listByOwner = jest.fn().mockResolvedValueOnce(sampleBooks).mockRejectedValue(new Error("Sem rede"));
    const findById = jest.fn().mockResolvedValue(sampleBooks[0]);
    const primary = { listByOwner, findById } as unknown as IBookDataSource;
    const storage = new MockStorage();
    await new CachedBookDataSource(primary, { storage }).listByOwner("user-1");

    const source = new CachedBookDataSource(primary, { storage });
    await expect(source.readOwnerListings("user-1")).resolves.toEqual({ data: [sampleBooks[0]], cachedAt: expect.any(Number) });
    await expect(source.readOwnerListings("user-2")).rejects.toThrow("Sem rede");
    await source.readBookDetail(sampleBooks[0].id);
    await source.clearBooksCache();
    expect(await storage.getAllKeys()).toEqual([]);
  });

  it("lê a cópia imediatamente quando o aparelho já detectou a desconexão", async () => {
    const list = jest.fn().mockResolvedValue(sampleBooks);
    const network = { isOnline: jest.fn().mockResolvedValueOnce(true).mockResolvedValue(false), subscribe: jest.fn() };
    const source = new CachedBookDataSource({ list } as unknown as IBookDataSource, { storage: new MockStorage(), network });
    await source.list();

    await expect(source.readCatalog()).resolves.toEqual({ data: sampleBooks, cachedAt: expect.any(Number) });
    await expect(source.list({ offset: 20 })).rejects.toThrow("Conecte-se à internet");
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("recusa paginação e filtros offline sem sobrescrever a cópia integral", async () => {
    const list = jest.fn()
      .mockResolvedValueOnce(sampleBooks)
      .mockResolvedValueOnce([sampleBooks[1]])
      .mockRejectedValue(new Error("Sem rede"));
    const primary = { list } as unknown as IBookDataSource;
    const source = new CachedBookDataSource(primary, { storage: new MockStorage() });

    await source.list();
    await source.list({ modality: "trade" });
    await expect(source.list({ offset: 20 })).rejects.toThrow("Sem rede");
    await expect(source.list({ limit: 1 })).rejects.toThrow("Sem rede");
    await expect(source.list({ modality: "trade" })).rejects.toThrow("Sem rede");
    await expect(source.list()).resolves.toEqual(sampleBooks);
  });

  it("reabre detalhes públicos fora da lista depois de reiniciar", async () => {
    const draft = { ...sampleBooks[0], id: "rascunho", status: "draft" };
    const findById = jest.fn().mockResolvedValueOnce(sampleBooks[1]).mockResolvedValueOnce(draft)
      .mockRejectedValue(new Error("Sem rede"));
    const primary = { findById } as unknown as IBookDataSource;
    const storage = new MockStorage();

    const online = new CachedBookDataSource(primary, { storage });
    await online.findById(sampleBooks[1].id);
    await online.findById(draft.id);

    const reopened = new CachedBookDataSource(primary, { storage });
    await expect(reopened.findById(sampleBooks[1].id)).resolves.toEqual(sampleBooks[1]);
    await expect(reopened.findById(draft.id)).rejects.toThrow("Sem rede");
  });

  it("encontra livro por ID no cache se a rede falhar", async () => {
    const primary: IBookDataSource = {
      list: jest.fn().mockResolvedValue(sampleBooks),
      findById: jest.fn().mockRejectedValue(new Error("Network timeout")),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn(),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    // Popula cache
    await cachedDs.list();

    // Busca por ID offline
    const book = await cachedDs.findById("livro-1");
    expect(book).toEqual(sampleBooks[0]);
  });

  it("mantém a cópia e incorpora um novo anúncio confirmado", async () => {
    const primary: IBookDataSource = {
      list: jest.fn().mockResolvedValue(sampleBooks),
      findById: jest.fn(),
      create: jest.fn().mockResolvedValue({ ...sampleBooks[0], id: "novo" }),
      update: jest.fn().mockResolvedValue(sampleBooks[0]),
      updateStatus: jest.fn().mockResolvedValue(sampleBooks[0]),
      delete: jest.fn().mockResolvedValue(undefined),
      listByOwner: jest.fn(),
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

    expect(JSON.parse((await storage.getItem("ipebook:cache:books:list")) ?? "").data.map((book: Book) => book.id))
      .toEqual(["novo", "livro-1", "livro-2"]);
  });

  it("armazena e recupera os livros da estante do anunciante offline (Spec 130 / ADR 0101)", async () => {
    const draft = { ...sampleBooks[0], id: "rascunho-privado", status: "draft" as const };
    const ownerBooks = [sampleBooks[0], draft];
    const primary: IBookDataSource = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest
        .fn()
        .mockResolvedValueOnce(ownerBooks)
        .mockRejectedValueOnce(new Error("Network failed")),
    };

    const storage = new MockStorage();
    const legacyKey = "ipebook:cache:books:owner:outro-usuario";
    await storage.setItem(legacyKey, JSON.stringify({ timestamp: Date.now(), data: [draft] }));
    const cachedDs = new CachedBookDataSource(primary, { storage });

    // 1ª chamada: online
    const resultOnline = await cachedDs.listByOwner("user-1");
    expect(resultOnline).toEqual(ownerBooks);
    expect(primary.listByOwner).toHaveBeenCalledTimes(1);

    const savedInStorage = await storage.getItem("ipebook:cache:books:owner-v2:user-1");
    expect(savedInStorage).not.toBeNull();
    expect(savedInStorage).not.toContain(draft.id);
    expect(await storage.getItem(legacyKey)).toBeNull();

    // 2ª chamada: offline
    const resultOffline = await cachedDs.listByOwner("user-1");
    expect(resultOffline).toEqual([sampleBooks[0]]);
    expect(primary.listByOwner).toHaveBeenCalledTimes(2);
  });

  it("mantém a cópia da estante e incorpora o livro confirmado", async () => {
    const primary: IBookDataSource = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn().mockResolvedValue({ ...sampleBooks[0], id: "novo", ownerId: "user-1" }),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      listByOwner: jest.fn().mockResolvedValue([sampleBooks[0]]),
    };

    const storage = new MockStorage();
    const cachedDs = new CachedBookDataSource(primary, { storage });

    await cachedDs.listByOwner("user-1");
    expect(await storage.getItem("ipebook:cache:books:owner-v2:user-1")).not.toBeNull();

    await cachedDs.create({
      title: "Outro Livro",
      author: "Outro Autor",
      status: "available",
      modality: "donation",
      ownerId: "user-1",
    });

    expect(JSON.parse((await storage.getItem("ipebook:cache:books:owner-v2:user-1")) ?? "").data.map((book: Book) => book.id))
      .toEqual(["novo", "livro-1"]);
  });
});
