import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { Favorite } from "@/model/entities/favorite";
import { DataSourceError } from "@/model/errors";

type Row = { id: string; user_id: string; book_id: string; created_at: string };
const map = (row: Row): Favorite => ({ id: row.id, userId: row.user_id, bookId: row.book_id, createdAt: row.created_at });

export class SupabaseFavoriteDataSource implements IFavoriteDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async listByUser(userId: string) {
    const { data, error } = await this.client.from("v2_favorites")
      .select("id,user_id,book_id,created_at").eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar favoritos.");
    return (data as Row[]).map(map);
  }

  async add(userId: string, bookId: string) {
    const { data, error } = await this.client.from("v2_favorites")
      .insert({ user_id: userId, book_id: bookId })
      .select("id,user_id,book_id,created_at").single();
    if (error || !data) throw new DataSourceError("Não foi possível favoritar o anúncio.");
    return map(data as Row);
  }

  async remove(userId: string, bookId: string) {
    const { error } = await this.client.from("v2_favorites")
      .delete().eq("user_id", userId).eq("book_id", bookId);
    if (error) throw new DataSourceError("Não foi possível remover o favorito.");
  }
}
