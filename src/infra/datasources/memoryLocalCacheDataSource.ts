import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";

/** Implementação em memória para testes (Spec 073). */
export class MemoryLocalCacheDataSource implements ILocalCacheDataSource {
  clearedTimes = 0;

  async clearBooksCache(): Promise<void> {
    this.clearedTimes += 1;
  }
}
