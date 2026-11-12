import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";

export class LocalCacheUseCases implements ILocalCacheUseCases {
  constructor(private readonly localCache: ILocalCacheDataSource) {}

  async clearBooksCache(): Promise<void> {
    await this.localCache.clearBooksCache();
  }
}
