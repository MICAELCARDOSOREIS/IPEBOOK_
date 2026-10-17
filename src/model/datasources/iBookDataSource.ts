import type { Book } from "@/model/entities/book";

export interface IBookDataSource {
  list(): Promise<readonly Book[]>;
  create(book: Omit<Book, "id">): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  updateStatus(id: string, status: Book["status"]): Promise<Book>;
  update(id: string, data: Partial<Omit<Book, "id" | "ownerId">>): Promise<Book>;
  listByOwner(ownerId: string): Promise<readonly Book[]>;
  delete(id: string): Promise<void>;
}
