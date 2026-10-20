import type { ISearchHistoryDataSource } from "@/model/datasources/iSearchHistoryDataSource";

const MAX_ITEMS = 10;

export class MemorySearchHistoryDataSource implements ISearchHistoryDataSource {
  private store = new Map<string, string[]>();

  async list(ownerKey: string) {
    return this.store.get(ownerKey) ?? [];
  }

  async add(ownerKey: string, term: string) {
    const current = this.store.get(ownerKey) ?? [];
    const next = [term, ...current.filter((entry) => entry !== term)].slice(0, MAX_ITEMS);
    this.store.set(ownerKey, next);
    return next;
  }

  async clear(ownerKey: string) {
    this.store.delete(ownerKey);
  }
}
