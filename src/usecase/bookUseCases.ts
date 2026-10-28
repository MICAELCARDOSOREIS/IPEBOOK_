import type { IBookDataSource, ListBooksOptions } from "@/model/datasources/iBookDataSource";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import type { Book } from "@/model/entities/book";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { validateBookPayload, validateDraftPayload } from "@/model/validators/bookValidator";
import { normalizeEdition } from "@/model/validators/bookEdition";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";
import type { CreateListingInput, IBookUseCases, SaveDraftInput } from "@/usecase/iBookUseCases";

export class BookUseCases implements IBookUseCases {
  constructor(private readonly dataSource: IBookDataSource, private readonly alerts?: ISearchAlertUseCases) {}

  listBooks(options?: ListBooksOptions) {
    return this.dataSource.list(options);
  }

  async createListing(input: CreateListingInput, sessionUserId: string | null): Promise<Book> {
    if (!sessionUserId) {
      throw new AuthError("Sessão obrigatória para cadastrar anúncio.");
    }

    const sanitizedTitle = sanitizeTextInput(input.title);
    const sanitizedAuthor = sanitizeTextInput(input.author);
    const sanitizedCategory = input.category ? sanitizeTextInput(input.category) : undefined;
    const sanitizedCity = input.city ? sanitizeTextInput(input.city) : "Piripiri";
    const sanitizedState = input.state ? sanitizeTextInput(input.state) : "PI";
    const sanitizedNeighborhood = input.neighborhood ? sanitizeTextInput(input.neighborhood) : undefined;
    const sanitizedDescription = input.description ? sanitizeTextInput(input.description) : undefined;

    const payload = {
      id: "temp",
      title: sanitizedTitle,
      author: sanitizedAuthor,
      category: sanitizedCategory,
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
      city: sanitizedCity,
      state: sanitizedState,
      neighborhood: sanitizedNeighborhood,
      condition: input.condition,
      description: sanitizedDescription,
      photoUrl: input.photoUrl,
      photos: input.photos,
    };

    const validation = validateBookPayload(payload);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    const book = await this.dataSource.create({
      title: sanitizedTitle,
      author: sanitizedAuthor,
      ...(sanitizedCategory ? { category: sanitizedCategory } : {}),
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
      status: "available",
      city: sanitizedCity,
      state: sanitizedState,
      ...(sanitizedNeighborhood ? { neighborhood: sanitizedNeighborhood } : {}),
      ...(input.condition ? { condition: input.condition } : {}),
      ...(sanitizedDescription ? { description: sanitizedDescription } : {}),
      ...normalizeEdition(input),
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
    // Rascunhos (Spec 017) têm tela própria; a lista "Meus anúncios" só traz publicados.
    const mine = await this.dataSource.listByOwner(sessionUserId.trim());
    return mine.filter((book) => book.status !== "draft");
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

    if (book.status === "reserved" || book.status === "delivered") {
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

    if (book.status === "reserved" || book.status === "delivered") {
      throw new ValidationError("Não é possível editar anúncio com negociação aceita em andamento.");
    }

    const nextTitle = input.title !== undefined ? sanitizeTextInput(input.title) : book.title;
    const nextAuthor = input.author !== undefined ? sanitizeTextInput(input.author) : book.author;
    const nextModality = input.modality !== undefined ? input.modality : book.modality;
    const nextPrice = nextModality === "sale" ? (input.price !== undefined ? input.price : book.price) : undefined;
    const nextCategory = input.category !== undefined ? (input.category ? sanitizeTextInput(input.category) : undefined) : book.category;
    const nextCity = input.city !== undefined ? (input.city ? sanitizeTextInput(input.city) : "Piripiri") : book.city;
    const nextState = input.state !== undefined ? (input.state ? sanitizeTextInput(input.state) : "PI") : book.state;
    const nextNeighborhood = input.neighborhood !== undefined ? (input.neighborhood ? sanitizeTextInput(input.neighborhood) : undefined) : book.neighborhood;
    const nextCondition = input.condition !== undefined ? input.condition : book.condition;
    const nextDescription = input.description !== undefined
      ? (input.description ? sanitizeTextInput(input.description) : undefined)
      : book.description;
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
      condition: nextCondition,
      description: nextDescription,
      photoUrl: nextPhotoUrl,
      photos: nextPhotos,
    });
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    return this.dataSource.update(bookId.trim(), {
      title: nextTitle,
      author: nextAuthor,
      modality: nextModality,
      price: nextPrice,
      category: nextCategory,
      city: nextCity || "Piripiri",
      state: nextState || "PI",
      neighborhood: nextNeighborhood,
      condition: nextCondition,
      description: nextDescription,
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

    if (book.status === "reserved" || book.status === "delivered") {
      throw new ValidationError("Não é possível alterar o status de anúncio com negociação aceita.");
    }

    const nextStatus = book.status === "paused" ? "available" : "paused";
    return this.dataSource.updateStatus(book.id, nextStatus);
  }

  async listDrafts(sessionUserId: string | null): Promise<readonly Book[]> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para visualizar seus rascunhos.");
    }
    // listByOwner já vem ordenado por criação (mais recente primeiro) no datasource.
    const mine = await this.dataSource.listByOwner(sessionUserId.trim());
    return mine.filter((book) => book.status === "draft");
  }

  async saveDraft(input: SaveDraftInput, sessionUserId: string | null): Promise<Book> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para salvar rascunho.");
    }
    const ownerId = sessionUserId.trim();
    const sanitizedTitle = sanitizeTextInput(input.title ?? "");
    const sanitizedAuthor = sanitizeTextInput(input.author ?? "");
    const sanitizedCategory = input.category ? sanitizeTextInput(input.category) : undefined;
    const sanitizedNeighborhood = input.neighborhood ? sanitizeTextInput(input.neighborhood) : undefined;
    const sanitizedDescription = input.description ? sanitizeTextInput(input.description) : undefined;

    const candidate = {
      ownerId,
      title: sanitizedTitle,
      author: sanitizedAuthor,
      category: sanitizedCategory,
      modality: input.modality,
      price: input.price,
      city: "Piripiri",
      state: "PI",
      neighborhood: sanitizedNeighborhood,
      condition: input.condition,
      description: sanitizedDescription,
      photoUrl: input.photoUrl?.trim(),
      photos: input.photos,
      status: "draft" as const,
      draftStep: input.draftStep,
    };

    const validation = validateDraftPayload(candidate);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    const campos = {
      title: sanitizedTitle,
      author: sanitizedAuthor,
      category: sanitizedCategory,
      modality: input.modality,
      price: input.price,
      city: "Piripiri",
      state: "PI",
      neighborhood: sanitizedNeighborhood,
      condition: input.condition,
      description: sanitizedDescription,
      ...normalizeEdition(input),
      photoUrl: input.photoUrl?.trim(),
      photos: input.photos,
    };

    if (input.draftId) {
      const existing = await this.dataSource.findById(input.draftId);
      if (!existing) {
        throw new DataSourceError("Rascunho não encontrado.");
      }
      if (existing.ownerId !== ownerId) {
        throw new AuthError("Apenas quem criou o rascunho pode editá-lo.");
      }
      if (existing.status !== "draft") {
        throw new ValidationError("Este anúncio não é mais um rascunho.");
      }
      return this.dataSource.update(input.draftId, { ...campos, draftStep: input.draftStep });
    }

    return this.dataSource.create({ ...campos, ownerId, status: "draft", draftStep: input.draftStep });
  }

  async discardDraft(bookId: string, sessionUserId: string | null): Promise<void> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para descartar rascunho.");
    }
    if (!bookId || !bookId.trim()) {
      throw new ValidationError("Identificador do rascunho é obrigatório.");
    }
    const ownerId = sessionUserId.trim();
    const book = await this.dataSource.findById(bookId.trim());
    if (!book) {
      throw new DataSourceError("Rascunho não encontrado.");
    }
    if (book.ownerId !== ownerId) {
      throw new AuthError("Apenas quem criou o rascunho pode descartá-lo.");
    }
    if (book.status !== "draft") {
      throw new ValidationError("Este anúncio não é um rascunho.");
    }
    await this.dataSource.delete(bookId.trim());
  }

  async publishDraft(draftId: string, input: CreateListingInput, sessionUserId: string | null): Promise<Book> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para publicar anúncio.");
    }
    if (!draftId || !draftId.trim()) {
      throw new ValidationError("Identificador do rascunho é obrigatório.");
    }
    const ownerId = sessionUserId.trim();
    const existing = await this.dataSource.findById(draftId.trim());
    if (!existing) {
      throw new DataSourceError("Rascunho não encontrado.");
    }
    if (existing.ownerId !== ownerId) {
      throw new AuthError("Apenas quem criou o rascunho pode publicá-lo.");
    }
    if (existing.status !== "draft") {
      throw new ValidationError("Este anúncio já foi publicado.");
    }

    const sanitizedTitle = sanitizeTextInput(input.title);
    const sanitizedAuthor = sanitizeTextInput(input.author);
    const sanitizedCategory = input.category ? sanitizeTextInput(input.category) : undefined;
    const sanitizedNeighborhood = input.neighborhood ? sanitizeTextInput(input.neighborhood) : undefined;
    const sanitizedDescription = input.description ? sanitizeTextInput(input.description) : undefined;

    const validation = validateBookPayload({
      id: draftId,
      ownerId,
      title: sanitizedTitle,
      author: sanitizedAuthor,
      category: sanitizedCategory,
      modality: input.modality,
      price: input.price,
      city: input.city ? sanitizeTextInput(input.city) : "Piripiri",
      state: input.state ? sanitizeTextInput(input.state) : "PI",
      neighborhood: sanitizedNeighborhood,
      condition: input.condition,
      description: sanitizedDescription,
      photoUrl: input.photoUrl,
      photos: input.photos,
    });
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    const book = await this.dataSource.update(draftId.trim(), {
      title: sanitizedTitle,
      author: sanitizedAuthor,
      ...(sanitizedCategory ? { category: sanitizedCategory } : {}),
      modality: input.modality,
      price: input.price,
      city: "Piripiri",
      state: "PI",
      ...(sanitizedNeighborhood ? { neighborhood: sanitizedNeighborhood } : {}),
      ...(input.condition ? { condition: input.condition } : {}),
      ...(sanitizedDescription ? { description: sanitizedDescription } : {}),
      ...(input.photoUrl?.trim() ? { photoUrl: input.photoUrl.trim() } : {}),
      ...(input.photos && input.photos.length > 0 ? { photos: input.photos } : {}),
      status: "available",
    });
    await this.alerts?.matchNewBook(book);
    return book;
  }
}
