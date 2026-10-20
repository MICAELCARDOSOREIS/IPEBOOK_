export interface ISearchHistoryDataSource {
  list(ownerKey: string): Promise<readonly string[]>;
  add(ownerKey: string, term: string): Promise<readonly string[]>;
  clear(ownerKey: string): Promise<void>;
}
