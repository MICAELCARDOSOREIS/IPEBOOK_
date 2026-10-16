import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { Book } from "@/model/entities/book";
import type { SearchAlert } from "@/model/entities/searchAlert";
import { DataSourceError } from "@/model/errors";

type Row = { id: string; user_id: string; query: string; active: boolean; created_at: string };
const map = (row: Row): SearchAlert => ({ id: row.id, userId: row.user_id, query: row.query, active: row.active, createdAt: row.created_at });

export class SupabaseSearchAlertDataSource implements ISearchAlertDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async listByUser(userId: string) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .select("id,user_id,query,active,created_at").eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar alertas.");
    return (data as Row[]).map(map);
  }

  async add(userId: string, query: string) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .insert({ user_id: userId, query })
      .select("id,user_id,query,active,created_at").single();
    if (error || !data) throw new DataSourceError("Não foi possível criar o alerta.");
    return map(data as Row);
  }

  async setActive(userId: string, id: string, active: boolean) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .update({ active }).eq("id", id).eq("user_id", userId).select("id");
    if (error || !data?.length) throw new DataSourceError("Não foi possível atualizar o alerta.");
  }

  async remove(userId: string, id: string) {
    const { error } = await this.client.from("v2_search_alerts")
      .delete().eq("id", id).eq("user_id", userId);
    if (error) throw new DataSourceError("Não foi possível excluir o alerta.");
  }

  async matchNewBook(_book: Book) {
    // O trigger do banco cria notificações na mesma transação que publica o anúncio.
  }
}
