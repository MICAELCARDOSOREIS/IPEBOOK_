import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Book } from "@/model/entities/book";
import type { IBookDataSource, ListBooksOptions } from "@/model/datasources/iBookDataSource";

export interface IKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface CachedBookDataSourceOptions {
  storage?: IKeyValueStorage;
  cacheKeyPrefix?: string;
  ttlMs?: number;
}

interface CachePayload<T> {
  timestamp: number;
  data: T;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos
export const DEFAULT_PREFIX = "ipebook:cache:books";
/** Chave do catálogo offline; exportada para a limpeza em Configurações (Spec 073). */
export const BOOKS_LIST_CACHE_KEY = `${DEFAULT_PREFIX}:list`;
export const BOOKS_OWNER_CACHE_PREFIX = `${DEFAULT_PREFIX}:owner:`;

/**
 * Decorator resiliente para IBookDataSource que adiciona cache local (Offline First)
 * e fallback automático para os últimos dados consultados caso a rede falhe (Spec 130 / ADR 0101).
 */
export class CachedBookDataSource implements IBookDataSource {
  private readonly primary: IBookDataSource;
  private readonly storage: IKeyValueStorage;
  private readonly prefix: string;
  private readonly listKey: string;
  private readonly ttlMs: number;

  constructor(primary: IBookDataSource, options: CachedBookDataSourceOptions = {}) {
    this.primary = primary;
    this.storage = options.storage ?? AsyncStorage;
    this.prefix = options.cacheKeyPrefix ?? DEFAULT_PREFIX;
    this.listKey = `${this.prefix}:list`;
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  }

  private ownerListKey(ownerId: string): string {
    return `${this.prefix}:owner:${ownerId}`;
  }

  private async readCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.storage.getItem(key);
      if (!raw) return null;
      const parsed: CachePayload<T> = JSON.parse(raw);
      if (!Number.isFinite(parsed.timestamp) || Date.now() - parsed.timestamp > this.ttlMs) {
        await this.storage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  private async writeCache<T>(key: string, data: T): Promise<void> {
    try {
      const payload: CachePayload<T> = {
        timestamp: Date.now(),
        data,
      };
      await this.storage.setItem(key, JSON.stringify(payload));
    } catch {
      // Falha de escrita no cache não deve abortar o fluxo principal
    }
  }

  private async invalidate(ownerId?: string): Promise<void> {
    try {
      await this.storage.removeItem(this.listKey);
      if (ownerId) {
        await this.storage.removeItem(this.ownerListKey(ownerId));
      }
    } catch {
      // Ignora erro de limpeza
    }
  }

  async list(options?: ListBooksOptions): Promise<readonly Book[]> {
    try {
      const fresh = await this.primary.list(options);
      // Salva no cache se for a consulta padrão (primeira página sem paginação customizada)
      if (!options?.offset) {
        await this.writeCache(this.listKey, fresh);
      }
      return fresh;
    } catch (networkError) {
      // Fallback offline: se a chamada de rede falhar, tenta devolver os dados em cache
      const cached = await this.readCache<Book[]>(this.listKey);
      if (cached && cached.length > 0) {
        return cached;
      }
      throw networkError;
    }
  }

  async findById(id: string): Promise<Book | null> {
    try {
      return await this.primary.findById(id);
    } catch (networkError) {
      // Se a rede falhar, tenta localizar o livro na lista em cache local
      const cached = await this.readCache<Book[]>(this.listKey);
      if (cached) {
        const found = cached.find((b) => b.id === id);
        if (found) return found;
      }
      throw networkError;
    }
  }

  async create(book: Omit<Book, "id">): Promise<Book> {
    const created = await this.primary.create(book);
    await this.invalidate(book.ownerId);
    return created;
  }

  async update(id: string, data: Partial<Omit<Book, "id" | "ownerId">>): Promise<Book> {
    const updated = await this.primary.update(id, data);
    await this.invalidate(updated.ownerId);
    return updated;
  }

  async updateStatus(id: string, status: Book["status"]): Promise<Book> {
    const updated = await this.primary.updateStatus(id, status);
    await this.invalidate(updated.ownerId);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.primary.delete(id);
    await this.invalidate();
  }

  async listByOwner(ownerId: string): Promise<readonly Book[]> {
    const key = this.ownerListKey(ownerId);
    try {
      const fresh = await this.primary.listByOwner(ownerId);
      await this.writeCache(key, fresh);
      return fresh;
    } catch (networkError) {
      const cached = await this.readCache<Book[]>(key);
      if (cached && cached.length > 0) {
        return cached;
      }
      throw networkError;
    }
  }
}
