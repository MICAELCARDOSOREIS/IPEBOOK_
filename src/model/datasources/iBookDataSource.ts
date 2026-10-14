import type { Book } from "@/model/entities/book";

export interface IBookDataSource {
  list(): Promise<readonly Book[]>;
  create(book: Omit<Book, "id">): Promise<Book>;
}
