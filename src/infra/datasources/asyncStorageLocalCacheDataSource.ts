import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOOKS_LIST_CACHE_KEY } from "@/infra/datasources/cachedBookDataSource";
import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";

/** Limpeza do cache local do catálogo sobre o AsyncStorage (Spec 073). */
export class AsyncStorageLocalCacheDataSource implements ILocalCacheDataSource {
  constructor(private readonly bookCache?: ILocalCacheDataSource) {}

  async clearBooksCache(): Promise<void> {
    if (this.bookCache) return this.bookCache.clearBooksCache();
    await AsyncStorage.removeItem(BOOKS_LIST_CACHE_KEY);
  }
}
