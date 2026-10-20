import type { ISearchHistoryDataSource } from "@/model/datasources/iSearchHistoryDataSource";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";

const GUEST_KEY = "guest";

export class SearchHistoryUseCases implements ISearchHistoryUseCases {
  constructor(private readonly history: ISearchHistoryDataSource) {}

  private ownerKey(userId: string | null): string {
    return userId?.trim() || GUEST_KEY;
  }

  listTerms(userId: string | null) {
    return this.history.list(this.ownerKey(userId));
  }

  registerSearch(userId: string | null, term: string) {
    const value = term.trim();
    if (!value) return this.history.list(this.ownerKey(userId));
    return this.history.add(this.ownerKey(userId), value);
  }

  clearHistory(userId: string | null) {
    return this.history.clear(this.ownerKey(userId));
  }
}
