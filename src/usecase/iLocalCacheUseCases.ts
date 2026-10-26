import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";

export interface ILocalCacheUseCases {
  clearBooksCache(): Promise<void>;
}
