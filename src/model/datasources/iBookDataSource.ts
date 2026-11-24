import type { Book } from "@/model/entities/book";

export type ListBooksOptions = {
  limit?: number;
  offset?: number;
  neighborhood?: string;
  modality?: Book["modality"];
  onlyBoxes?: boolean;
};

export type BookRead<T> = Readonly<{ data: T; cachedAt: number | null }>;

export interface IBookDataSource {
  readCatalog?(options?: ListBooksOptions): Promise<BookRead<readonly Book[]>>;
  readOwnerListings?(ownerId: string): Promise<BookRead<readonly Book[]>>;
  readBookDetail?(id: string): Promise<BookRead<Book | null>>;
  list(options?: ListBooksOptions): Promise<readonly Book[]>;
  create(book: Omit<Book, "id">): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  updateStatus(id: string, status: Book["status"]): Promise<Book>;
  update(id: string, data: Partial<Omit<Book, "id" | "ownerId">>): Promise<Book>;
  listByOwner(ownerId: string): Promise<readonly Book[]>;
  delete(id: string): Promise<void>;
}
