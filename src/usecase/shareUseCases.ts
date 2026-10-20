import { ValidationError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";

export class ShareUseCases implements IShareUseCases {
  buildListingSharePath(bookId: string): string {
    if (!bookId?.trim()) throw new ValidationError("Anúncio inválido.");
    return `/livro/${bookId.trim()}`;
  }
}
