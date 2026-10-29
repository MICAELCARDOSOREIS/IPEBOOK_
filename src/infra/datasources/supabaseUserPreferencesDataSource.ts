import type {
  IUserPreferencesDataSource,
  StoredUserPreferences,
  UserPreferencesUpdate,
} from "@/model/datasources/iUserPreferencesDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type PreferencesRow = {
  user_id: string;
  phone: string | null;
  neighborhood: string | null;
};

function mapPreferences(row: PreferencesRow): StoredUserPreferences {
  return {
    userId: row.user_id,
    phone: row.phone ?? undefined,
    neighborhood: row.neighborhood ?? undefined,
  };
}

const columns = "user_id,phone,neighborhood";

export class SupabaseUserPreferencesDataSource implements IUserPreferencesDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async findById(userId: string): Promise<StoredUserPreferences | null> {
    const { data, error } = await this.client
      .from("v2_user_preferences")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new DataSourceError("Não foi possível consultar as preferências.");
    return data ? mapPreferences(data as PreferencesRow) : null;
  }

  async upsert(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences> {
    const { error } = await this.client.from("v2_user_preferences").upsert(
      { user_id: userId, phone: patch.phone ?? null, neighborhood: patch.neighborhood ?? null },
      { onConflict: "user_id" },
    );
    if (error) throw new DataSourceError("Não foi possível salvar as preferências.");
    const updated = await this.findById(userId);
    if (!updated) throw new DataSourceError("Não foi possível salvar as preferências.");
    return updated;
  }
}
