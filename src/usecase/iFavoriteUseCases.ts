import type { Book } from "@/model/entities/book";

export interface IFavoriteUseCases {
  listFavorites(userId: string | null): Promise<readonly Book[]>;
  isFavorite(userId: string | null, bookId: string): Promise<boolean>;
  toggleFavorite(userId: string | null, bookId: string): Promise<boolean>;
}
