import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";

export class MemoryBookDataSource implements IBookDataSource {
  private readonly books: Book[];

  constructor(books: readonly Book[] = []) {
    this.books = books.map((book) => ({ ...book }));
  }

  async list(): Promise<readonly Book[]> {
    return this.books.map((book) => ({ ...book }));
  }

  async create(book: Omit<Book, "id">): Promise<Book> {
    const created: Book = {
      ...book,
      id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    this.books.push({ ...created });
    return { ...created };
  }
}
