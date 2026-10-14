import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import { AuthError, ValidationError } from "@/model/errors";
import { validateBookPayload } from "@/model/validators/bookValidator";
import type { CreateListingInput, IBookUseCases } from "@/usecase/iBookUseCases";

export class BookUseCases implements IBookUseCases {
  constructor(private readonly dataSource: IBookDataSource) {}

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
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
    };

    const validation = validateBookPayload(payload);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors[0]);
    }

    return this.dataSource.create({
      title: input.title.trim(),
      author: input.author.trim(),
      ownerId: sessionUserId,
      modality: input.modality,
      price: input.price,
      status: "available",
    });
  }
}
