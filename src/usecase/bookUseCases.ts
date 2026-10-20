import type { IBookDataSource, ListBooksOptions } from "@/model/datasources/iBookDataSource";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import type { Book } from "@/model/entities/book";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { validateBookPayload } from "@/model/validators/bookValidator";
import type { CreateListingInput, IBookUseCases } from "@/usecase/iBookUseCases";

export class BookUseCases implements IBookUseCases {
  constructor(private readonly dataSource: IBookDataSource, private readonly alerts?: ISearchAlertUseCases) {}

  listBooks(options?: ListBooksOptions) {
    return this.dataSource.list(options);
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
      city: input.city,
      state: input.state,
      neighborhood: input.neighborhood,
      photoUrl: input.photoUrl,
      photos: input.photos,
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
      city: input.city?.trim() || "Piripiri",
      state: input.state?.trim() || "PI",
      ...(input.neighborhood?.trim() ? { neighborhood: input.neighborhood.trim() } : {}),
      ...(input.photoUrl?.trim() ? { photoUrl: input.photoUrl.trim() } : {}),
      ...(input.photos && input.photos.length > 0 ? { photos: input.photos } : {}),
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

  async updateListing(
    bookId: string,
    input: import("@/usecase/iBookUseCases").UpdateListingInput,
    sessionUserId: string | null,
  ): Promise<Book> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para editar anúncio.");
    }

    if (!bookId || !bookId.trim()) {
      throw new ValidationError("Identificador do anúncio é obrigatório.");
    }

    const book = await this.dataSource.findById(bookId.trim());
    if (!book) {
      throw new DataSourceError("Anúncio não encontrado.");
    }

    if (book.ownerId !== sessionUserId.trim()) {
      throw new AuthError("Apenas quem anunciou o livro pode editá-lo.");
    }

    if (book.status === "reserved") {
      throw new ValidationError("Não é possível editar anúncio com negociação aceita em andamento.");
    }

    const nextTitle = input.title !== undefined ? input.title : book.title;
    const nextAuthor = input.author !== undefined ? input.author : book.author;
    const nextModality = input.modality !== undefined ? input.modality : book.modality;
    const nextPrice = nextModality === "sale" ? (input.price !== undefined ? input.price : book.price) : undefined;
    const nextCategory = input.category !== undefined ? input.category : book.category;
    const nextCity = input.city !== undefined ? input.city : book.city;
    const nextState = input.state !== undefined ? input.state : book.state;
    const nextNeighborhood = input.neighborhood !== undefined ? input.neighborhood : book.neighborhood;
    const nextPhotoUrl = input.photoUrl !== undefined ? input.photoUrl : book.photoUrl;
    const nextPhotos = input.photos !== undefined ? input.photos : book.photos;

    const validation = validateBookPayload({
      id: book.id,
      ownerId: book.ownerId,
      title: nextTitle,
      author: nextAuthor,
      category: nextCategory,
      modality: nextModality,
      price: nextPrice,
      city: nextCity,
      state: nextState,
      neighborhood: nextNeighborhood,
      photoUrl: nextPhotoUrl,
      photos: nextPhotos,
    });
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    return this.dataSource.update(bookId.trim(), {
      title: nextTitle.trim(),
      author: nextAuthor.trim(),
      modality: nextModality,
      price: nextPrice,
      category: nextCategory?.trim(),
      city: nextCity?.trim() || "Piripiri",
      state: nextState?.trim() || "PI",
      neighborhood: nextNeighborhood?.trim(),
      photoUrl: nextPhotoUrl?.trim(),
      photos: nextPhotos,
    });
  }

  async togglePauseListing(bookId: string, sessionUserId: string | null): Promise<Book> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para pausar ou retomar anúncio.");
    }

    if (!bookId || !bookId.trim()) {
      throw new ValidationError("Identificador do anúncio é obrigatório.");
    }

    const book = await this.dataSource.findById(bookId.trim());
    if (!book) {
      throw new DataSourceError("Anúncio não encontrado.");
    }

    if (book.ownerId !== sessionUserId.trim()) {
      throw new AuthError("Apenas quem anunciou o livro pode pausar ou reativar o anúncio.");
    }

    if (book.status === "reserved") {
      throw new ValidationError("Não é possível alterar o status de anúncio com negociação aceita.");
    }

    const nextStatus = book.status === "paused" ? "available" : "paused";
    return this.dataSource.updateStatus(book.id, nextStatus);
  }
}
