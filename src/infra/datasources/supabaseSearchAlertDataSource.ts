import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { Book, BookModality } from "@/model/entities/book";
import { ALL_ALERT_MODALITIES, type SearchAlert } from "@/model/entities/searchAlert";
import { DataSourceError } from "@/model/errors";

type Row = { id: string; user_id: string; query: string; active: boolean; created_at: string; modalities: string[] | null };
const map = (row: Row): SearchAlert => ({
  id: row.id,
  userId: row.user_id,
  query: row.query,
  active: row.active,
  createdAt: row.created_at,
  modalities: (row.modalities?.length ? row.modalities : [...ALL_ALERT_MODALITIES]) as readonly BookModality[],
});

export class SupabaseSearchAlertDataSource implements ISearchAlertDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async listByUser(userId: string) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .select("id,user_id,query,active,created_at,modalities").eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar alertas.");
    return (data as Row[]).map(map);
  }

  async add(userId: string, query: string, modalities: readonly BookModality[] = ALL_ALERT_MODALITIES) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .insert({ user_id: userId, query, modalities: [...modalities] })
      .select("id,user_id,query,active,created_at,modalities").single();
    if (error || !data) throw new DataSourceError("Não foi possível criar o alerta.");
    return map(data as Row);
  }

  async update(userId: string, id: string, query: string, modalities?: readonly BookModality[]) {
    const { data, error } = await this.client.from("v2_search_alerts")
      .update(modalities === undefined ? { query } : { query, modalities: [...modalities] }).eq("id", id).eq("user_id", userId).select("id");
    if (error || !data?.length) throw new DataSourceError("Não foi possível atualizar o alerta.");
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
