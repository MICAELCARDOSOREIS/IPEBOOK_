import type { Book, BookModality } from "@/model/entities/book";

export type CreateListingInput = Readonly<{
  title: string;
  author: string;
  modality: BookModality;
  price?: number;
}>;

export interface IBookUseCases {
  listBooks(): Promise<readonly Book[]>;
  createListing(input: CreateListingInput, sessionUserId: string | null): Promise<Book>;
  getBookById(id: string): Promise<Book>;
  listMyListings(sessionUserId: string | null): Promise<readonly Book[]>;
}
