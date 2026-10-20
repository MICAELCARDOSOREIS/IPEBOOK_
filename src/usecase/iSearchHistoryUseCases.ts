export interface ISearchHistoryUseCases {
  listTerms(userId: string | null): Promise<readonly string[]>;
  registerSearch(userId: string | null, term: string): Promise<readonly string[]>;
  clearHistory(userId: string | null): Promise<void>;
}
