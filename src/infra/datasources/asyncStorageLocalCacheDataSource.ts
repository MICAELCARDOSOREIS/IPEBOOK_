import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOOKS_LIST_CACHE_KEY } from "@/infra/datasources/cachedBookDataSource";
import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";

/** Limpeza do cache local do catálogo sobre o AsyncStorage (Spec 073). */
export class AsyncStorageLocalCacheDataSource implements ILocalCacheDataSource {
  async clearBooksCache(): Promise<void> {
    await AsyncStorage.removeItem(BOOKS_LIST_CACHE_KEY);
  }
}
