import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import type { Book } from "@/model/entities/book";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { validateBookPayload } from "@/model/validators/bookValidator";
import type { CreateListingInput, IBookUseCases } from "@/usecase/iBookUseCases";

export class BookUseCases implements IBookUseCases {
  constructor(private readonly dataSource: IBookDataSource, private readonly alerts?: ISearchAlertUseCases) {}

  listBooks() {
    return this.dataSource.list();
  }

  async createListing(input: CreateListingInput, sessionUserId: string | null): Promise<Book> {
    if (!sessionUserId) {
      throw new AuthError("Sessão obrigatória para cadastrar anúncio.");
    }

    const payload = {
      id: "temp",
      title: input.title,
      author: input.author,
      category: input.category,
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
    };

    const validation = validateBookPayload(payload);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    const book = await this.dataSource.create({
      title: input.title.trim(),
      author: input.author.trim(),
      ...(input.category?.trim() ? { category: input.category.trim() } : {}),
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
      status: "available",
    });
    await this.alerts?.matchNewBook(book);
    return book;
  }

  async getBookById(id: string): Promise<Book> {
    const book = await this.dataSource.findById(id);
    if (!book) {
      throw new DataSourceError("Anúncio não encontrado.");
    }
    return book;
  }

  async listMyListings(sessionUserId: string | null): Promise<readonly Book[]> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para visualizar seus anúncios.");
    }
    return this.dataSource.listByOwner(sessionUserId.trim());
  }

  async cancelListing(bookId: string, sessionUserId: string | null): Promise<void> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para cancelar anúncio.");
    }

    if (!bookId || !bookId.trim()) {
      throw new ValidationError("Identificador do anúncio é obrigatório.");
    }

    const book = await this.dataSource.findById(bookId.trim());
    if (!book) {
      throw new DataSourceError("Anúncio não encontrado.");
    }

    if (book.ownerId !== sessionUserId.trim()) {
      throw new AuthError("Apenas quem anunciou o livro pode cancelá-lo.");
    }

    if (book.status === "reserved") {
      throw new ValidationError("Não é possível remover anúncio com negociação aceita em andamento.");
    }

    await this.dataSource.delete(bookId.trim());
  }
}
