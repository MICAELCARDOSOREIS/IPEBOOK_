import type { IBookDataSource, ListBooksOptions } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import { DataSourceError } from "@/model/errors";

export class MemoryBookDataSource implements IBookDataSource {
  private readonly books: Book[];

  constructor(books: readonly Book[] = []) {
    this.books = books.map((book) => ({ ...book }));
  }

  async list(options?: ListBooksOptions): Promise<readonly Book[]> {
    const available = this.books
      .filter((book) => book.status !== "paused")
      .map((book) => ({ ...book }));

    if (options?.limit !== undefined || options?.offset !== undefined) {
      const offset = Math.max(0, options?.offset ?? 0);
      const limit = Math.max(1, options?.limit ?? 20);
      return available.slice(offset, offset + limit);
    }

    return available;
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

  async update(id: string, data: Partial<Omit<Book, "id" | "ownerId">>): Promise<Book> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index < 0) {
      throw new DataSourceError("Anúncio não encontrado.");
    }
    const current = this.books[index];
    const updated: Book = {
      ...current,
      ...data,
    };
    this.books[index] = updated;
    return { ...updated };
  }

  async listByOwner(ownerId: string): Promise<readonly Book[]> {
    return this.books.filter((book) => book.ownerId === ownerId).map((book) => ({ ...book }));
  }

  async delete(id: string): Promise<void> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index >= 0) {
      this.books.splice(index, 1);
    }
  }
}
