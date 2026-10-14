import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import { DataSourceError } from "@/model/errors";

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

  async findById(id: string): Promise<Book | null> {
    const found = this.books.find((book) => book.id === id);
    return found ? { ...found } : null;
  }

  async updateStatus(id: string, status: Book["status"]): Promise<Book> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index < 0) {
      throw new DataSourceError("Anúncio não encontrado.");
    }
    const updated: Book = { ...this.books[index], status };
    this.books[index] = updated;
    return { ...updated };
  }
}
