import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export class FavoriteUseCases implements IFavoriteUseCases {
  constructor(private readonly favorites: IFavoriteDataSource, private readonly books: IBookDataSource) {}

  private requireUser(userId: string | null): string {
    if (!userId?.trim()) throw new AuthError("Entre na sua conta para usar favoritos.");
    return userId.trim();
  }

  async listFavorites(userId: string | null) {
    const entries = await this.favorites.listByUser(this.requireUser(userId));
    const books = await Promise.all(entries.map((entry) => this.books.findById(entry.bookId)));
    return books.filter((book): book is NonNullable<typeof book> => book !== null);
  }

  async isFavorite(userId: string | null, bookId: string): Promise<boolean> {
    const entries = await this.favorites.listByUser(this.requireUser(userId));
    return entries.some((entry) => entry.bookId === bookId);
  }

  async toggleFavorite(userId: string | null, bookId: string): Promise<boolean> {
    const owner = this.requireUser(userId);
    if (!bookId.trim()) throw new ValidationError("Anúncio inválido.");
    const book = await this.books.findById(bookId);
    if (!book) throw new DataSourceError("Anúncio não encontrado.");
    if (await this.isFavorite(owner, bookId)) {
      await this.favorites.remove(owner, bookId);
      return false;
    }
    await this.favorites.add(owner, bookId);
    return true;
  }
}
