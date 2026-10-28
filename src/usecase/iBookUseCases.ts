import type { ListBooksOptions } from "@/model/datasources/iBookDataSource";
import type { Book, BookCondition, BookModality } from "@/model/entities/book";

export type CreateListingInput = Readonly<{
  title: string;
  author: string;
  category?: string;
  modality: BookModality;
  price?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  condition?: BookCondition;
  description?: string;
  /** Sinopse e dados da edição, vindos do ISBN (Spec 097). */
  synopsis?: string;
  publisher?: string;
  pageCount?: number;
  publicationYear?: number;
  photoUrl?: string;
  photos?: readonly string[];
}>;

export type UpdateListingInput = Readonly<{
  title?: string;
  author?: string;
  category?: string;
  modality?: BookModality;
  price?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  condition?: BookCondition;
  description?: string;
  photoUrl?: string;
  photos?: readonly string[];
}>;

export type SaveDraftInput = CreateListingInput & {
  /** Identificador do rascunho existente; ausente cria um novo (Spec 017). */
  draftId?: string;
  /** Etapa do assistente em que a pessoa salvou (1 Livro, 2 Fotos, 3 Detalhes). */
  draftStep?: number;
};

export interface IBookUseCases {
  listBooks(options?: ListBooksOptions): Promise<readonly Book[]>;
  createListing(input: CreateListingInput, sessionUserId: string | null): Promise<Book>;
  getBookById(id: string): Promise<Book>;
  listMyListings(sessionUserId: string | null): Promise<readonly Book[]>;
  cancelListing(bookId: string, sessionUserId: string | null): Promise<void>;
  updateListing(bookId: string, input: UpdateListingInput, sessionUserId: string | null): Promise<Book>;
  togglePauseListing(bookId: string, sessionUserId: string | null): Promise<Book>;
  listDrafts(sessionUserId: string | null): Promise<readonly Book[]>;
  saveDraft(input: SaveDraftInput, sessionUserId: string | null): Promise<Book>;
  discardDraft(bookId: string, sessionUserId: string | null): Promise<void>;
  publishDraft(draftId: string, input: CreateListingInput, sessionUserId: string | null): Promise<Book>;
}
