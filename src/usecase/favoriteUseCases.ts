import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export class FavoriteUseCases implements IFavoriteUseCases {
  private static readonly IDS_CACHE_TTL_MS = 60_000;
  private readonly idsCache = new Map<string, { ids: Set<string>; loadedAt: number }>();
  private readonly inflightIds = new Map<string, Promise<Set<string>>>();

  constructor(private readonly favorites: IFavoriteDataSource, private readonly books: IBookDataSource) {}

  private requireUser(userId: string | null): string {
    if (!userId?.trim()) throw new AuthError("Entre na sua conta para usar favoritos.");
    return userId.trim();
  }

  /**
   * Carrega e compartilha o conjunto de IDs favoritados por usuário.
   * Deduplica chamadas simultâneas (elimina tempestade N+1 quando dezenas de cards montam juntos
   * na Home e na Pesquisa) e reutiliza o conjunto em memória durante a janela de frescor.
   */
  private loadFavoriteIds(owner: string): Promise<Set<string>> {
    const cached = this.idsCache.get(owner);
    if (cached && Date.now() - cached.loadedAt < FavoriteUseCases.IDS_CACHE_TTL_MS) {
      return Promise.resolve(cached.ids);
    }
    const inflight = this.inflightIds.get(owner);
    if (inflight) return inflight;

    const promise = this.favorites
      .listByUser(owner)
      .then((entries) => {
        const ids = new Set(entries.map((entry) => entry.bookId));
        this.idsCache.set(owner, { ids, loadedAt: Date.now() });
        return ids;
      })
      .finally(() => {
        this.inflightIds.delete(owner);
      });

    this.inflightIds.set(owner, promise);
    return promise;
  }

  async listFavorites(userId: string | null) {
    const owner = this.requireUser(userId);
    const entries = await this.favorites.listByUser(owner);
    this.idsCache.set(owner, {
      ids: new Set(entries.map((entry) => entry.bookId)),
      loadedAt: Date.now(),
    });
    const books = await Promise.all(entries.map((entry) => this.books.findById(entry.bookId)));
    return books.filter((book): book is NonNullable<typeof book> => book !== null);
  }

  async isFavorite(userId: string | null, bookId: string): Promise<boolean> {
    const ids = await this.loadFavoriteIds(this.requireUser(userId));
    return ids.has(bookId);
  }

  async toggleFavorite(userId: string | null, bookId: string): Promise<boolean> {
    const owner = this.requireUser(userId);
    if (!bookId.trim()) throw new ValidationError("Anúncio inválido.");
    const book = await this.books.findById(bookId);
    if (!book) throw new DataSourceError("Anúncio não encontrado.");
    const currentlyFavorite = await this.isFavorite(owner, bookId);
    try {
      if (currentlyFavorite) {
        await this.favorites.remove(owner, bookId);
        const cached = this.idsCache.get(owner);
        if (cached) {
          cached.ids.delete(bookId);
          cached.loadedAt = Date.now();
        }
        return false;
      }
      await this.favorites.add(owner, bookId);
      const cached = this.idsCache.get(owner);
      if (cached) {
        cached.ids.add(bookId);
        cached.loadedAt = Date.now();
      }
      return true;
    } catch (error) {
      this.idsCache.delete(owner);
      throw error;
    }
  }
}
