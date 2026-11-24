import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BookRead, IBookDataSource, ListBooksOptions } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";
import { DataSourceError } from "@/model/errors";

export interface IKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys?(): Promise<readonly string[]>;
}

export interface CachedBookDataSourceOptions {
  storage?: IKeyValueStorage;
  network?: INetworkStatusDataSource;
  cacheKeyPrefix?: string;
}

interface CachePayload<T> {
  timestamp: number;
  data: T;
}

const MAX_DETAILS = 30;
const DEFAULT_PREFIX = "ipebook:cache:books";
export const BOOKS_LIST_CACHE_KEY = `${DEFAULT_PREFIX}:list`;
const OWNER_SUFFIX = ":owner-v2:";

function isPublic(book: Book): boolean {
  return book.status === "available" || book.status === "reserved";
}

export class CachedBookDataSource implements IBookDataSource {
  private readonly network?: INetworkStatusDataSource;
  private readonly storage: IKeyValueStorage;
  private readonly prefix: string;
  private readonly listKey: string;
  private readonly detailsKey: string;
  private cacheWrites: Promise<void>;
  private revision = 0;

  constructor(private readonly primary: IBookDataSource, options: CachedBookDataSourceOptions = {}) {
    this.network = options.network;
    this.storage = options.storage ?? AsyncStorage;
    this.prefix = options.cacheKeyPrefix ?? DEFAULT_PREFIX;
    this.listKey = `${this.prefix}:list`;
    this.detailsKey = `${this.prefix}:details`;
    this.cacheWrites = this.removeLegacyOwnerCache().catch(() => {});
  }

  private ownerListKey(ownerId: string): string {
    return `${this.prefix}${OWNER_SUFFIX}${ownerId}`;
  }

  private async removeLegacyOwnerCache(): Promise<void> {
    const keys = await this.storage.getAllKeys?.() ?? [];
    await Promise.all(keys.filter((key) => key.startsWith(`${this.prefix}:owner:`)).map((key) => this.storage.removeItem(key)));
  }

  private enqueue(update: () => Promise<void>): Promise<void> {
    const operation = this.cacheWrites.then(update);
    this.cacheWrites = operation.catch(() => {});
    return operation;
  }

  private async readCache<T>(key: string): Promise<CachePayload<T> | null> {
    try {
      const raw = await this.storage.getItem(key);
      if (!raw) return null;
      const parsed: CachePayload<T> = JSON.parse(raw);
      return Number.isFinite(parsed.timestamp) && Array.isArray(parsed.data) ? parsed : null;
    } catch {
      return null;
    }
  }

  private save<T>(key: string, payload: CachePayload<T>): Promise<void> {
    return this.storage.setItem(key, JSON.stringify(payload));
  }

  async clearBooksCache(): Promise<void> {
    this.revision += 1;
    await this.enqueue(async () => {
      const keys = await this.storage.getAllKeys?.() ?? [];
      const ownerKeys = keys.filter((key) => key.startsWith(`${this.prefix}${OWNER_SUFFIX}`));
      await Promise.all([this.listKey, this.detailsKey, ...ownerKeys].map((key) => this.storage.removeItem(key)));
    });
  }

  private async requireConnection(): Promise<void> {
    const isOnline = await this.network?.isOnline().catch(() => true);
    if (isOnline === false) throw new DataSourceError("Conecte-se à internet para consultar os livros.");
  }

  private async readList(
    key: string,
    load: () => Promise<readonly Book[]>,
    shouldStore: (book: Book) => boolean,
  ): Promise<BookRead<readonly Book[]>> {
    const revision = this.revision;
    let data: readonly Book[];
    try {
      await this.requireConnection();
      data = await load();
    } catch (error) {
      await this.cacheWrites;
      const cached = await this.readCache<readonly Book[]>(key);
      if (!cached) throw error;
      return { data: cached.data, cachedAt: cached.timestamp };
    }

    const snapshot = { data: data.filter(shouldStore), timestamp: Date.now() };
    await this.enqueue(async () => {
      if (revision === this.revision) await this.save(key, snapshot);
    }).catch(() => {});
    return { data, cachedAt: null };
  }

  async readCatalog(options?: ListBooksOptions): Promise<BookRead<readonly Book[]>> {
    if (options?.limit !== undefined || options?.offset !== undefined || options?.neighborhood ||
        options?.modality || options?.onlyBoxes) {
      await this.requireConnection();
      return { data: await this.primary.list(options), cachedAt: null };
    }
    return this.readList(this.listKey, () => this.primary.list(options), isPublic);
  }

  async list(options?: ListBooksOptions): Promise<readonly Book[]> {
    return (await this.readCatalog(options)).data;
  }

  async readOwnerListings(ownerId: string): Promise<BookRead<readonly Book[]>> {
    return this.readList(this.ownerListKey(ownerId), () => this.primary.listByOwner(ownerId),
      (book) => book.ownerId === ownerId && book.status !== "draft");
  }

  async listByOwner(ownerId: string): Promise<readonly Book[]> {
    return (await this.readOwnerListings(ownerId)).data;
  }

  private async updateDetails(id: string, book: Book | null, onlyIfCached = false): Promise<void> {
    const cached = await this.readCache<readonly CachePayload<Book>[]>(this.detailsKey);
    const items = (cached?.data ?? []).filter((item) => item.data.id !== id);
    if (book && isPublic(book) && (!onlyIfCached || items.length !== cached?.data.length)) {
      items.unshift({ data: book, timestamp: Date.now() });
    }
    if (cached || items.length > 0) {
      await this.save(this.detailsKey, { data: items.slice(0, MAX_DETAILS), timestamp: Date.now() });
    }
  }

  async readBookDetail(id: string): Promise<BookRead<Book | null>> {
    const revision = this.revision;
    let book: Book | null;
    try {
      await this.requireConnection();
      book = await this.primary.findById(id);
    } catch (error) {
      await this.cacheWrites;
      const details = await this.readCache<readonly CachePayload<Book>[]>(this.detailsKey);
      const detail = details?.data.find((entry) => entry.data.id === id);
      const catalog = await this.readCache<readonly Book[]>(this.listKey);
      const catalogBook = catalog?.data.find((entry) => entry.id === id);
      if (detail && (!catalogBook || detail.timestamp > (catalog?.timestamp ?? 0))) {
        return { data: detail.data, cachedAt: detail.timestamp };
      }
      if (catalog && catalogBook) return { data: catalogBook, cachedAt: catalog.timestamp };
      throw error;
    }

    await this.enqueue(async () => {
      if (revision !== this.revision) return;
      await this.updateDetails(id, book);
      if (!book || !isPublic(book)) await this.updateList(this.listKey, id, null);
    }).catch(() => {});
    return { data: book, cachedAt: null };
  }

  async findById(id: string): Promise<Book | null> {
    return (await this.readBookDetail(id)).data;
  }

  private async updateList(key: string, id: string, book: Book | null): Promise<void> {
    const snapshot = await this.readCache<readonly Book[]>(key);
    if (!snapshot) return;
    const books = snapshot.data.filter((item) => item.id !== id);
    if (book) {
      const position = snapshot.data.findIndex((item) => item.id === id);
      books.splice(position < 0 ? 0 : position, 0, book);
    }
    await this.save(key, { ...snapshot, data: books });
  }

  private async reconcile(id: string, book: Book | null): Promise<void> {
    this.revision += 1;
    await this.enqueue(async () => {
      const ownerKeys = book ? [this.ownerListKey(book.ownerId)] :
        (await this.storage.getAllKeys?.() ?? []).filter((key) => key.startsWith(`${this.prefix}${OWNER_SUFFIX}`));
      await Promise.all([
        this.updateList(this.listKey, id, book && isPublic(book) ? book : null),
        this.updateDetails(id, book, true),
        ...ownerKeys.map((key) => this.updateList(key, id, book?.status !== "draft" ? book : null)),
      ]);
    }).catch(() => {});
  }

  async create(book: Omit<Book, "id">): Promise<Book> {
    const created = await this.primary.create(book);
    await this.reconcile(created.id, created);
    return created;
  }

  async update(id: string, data: Partial<Omit<Book, "id" | "ownerId">>): Promise<Book> {
    const updated = await this.primary.update(id, data);
    await this.reconcile(id, updated);
    return updated;
  }

  async updateStatus(id: string, status: Book["status"]): Promise<Book> {
    const updated = await this.primary.updateStatus(id, status);
    await this.reconcile(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.primary.delete(id);
    await this.reconcile(id, null);
  }
}
