import type { SearchAlert } from "@/model/entities/searchAlert";
import type { Book, BookModality } from "@/model/entities/book";

export interface ISearchAlertDataSource {
  listByUser(userId: string): Promise<readonly SearchAlert[]>;
  add(userId: string, query: string, modalities: readonly BookModality[]): Promise<SearchAlert>;
  update(
    userId: string,
    id: string,
    query: string,
    modalities?: readonly BookModality[],
  ): Promise<void>;
  setActive(userId: string, id: string, active: boolean): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
  matchNewBook(book: Book): Promise<void>;
}
