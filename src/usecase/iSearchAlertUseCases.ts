import type { SearchAlert } from "@/model/entities/searchAlert";
import type { Book, BookModality } from "@/model/entities/book";

export interface ISearchAlertUseCases {
  listAlerts(userId: string | null): Promise<readonly SearchAlert[]>;
  createAlert(
    userId: string | null,
    query: string,
    modalities?: readonly BookModality[],
  ): Promise<SearchAlert>;
  updateAlert(
    userId: string | null,
    id: string,
    query: string,
    modalities?: readonly BookModality[],
  ): Promise<void>;
  setActive(userId: string | null, id: string, active: boolean): Promise<void>;
  deleteAlert(userId: string | null, id: string): Promise<void>;
  matchNewBook(book: Book): Promise<void>;
}
