import type { Favorite } from "@/model/entities/favorite";

export interface IFavoriteDataSource {
  listByUser(userId: string): Promise<readonly Favorite[]>;
  add(userId: string, bookId: string): Promise<Favorite>;
  remove(userId: string, bookId: string): Promise<void>;
}
