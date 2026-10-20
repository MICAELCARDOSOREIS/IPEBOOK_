import type { IProfileDataSource, StoredProfile } from "@/model/datasources/iProfileDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type ProfileRow = {
  id: string;
  name: string;
  created_at: string;
};

function mapProfile(row: ProfileRow): StoredProfile {
  return { userId: row.id, name: row.name, joinedAt: row.created_at };
}

const columns = "id,name,created_at";

export class SupabaseProfileDataSource implements IProfileDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async findById(userId: string): Promise<StoredProfile | null> {
    const { data, error } = await this.client.from("v2_profiles").select(columns).eq("id", userId).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível consultar o perfil.");
    return data ? mapProfile(data as ProfileRow) : null;
  }

  async ensure(userId: string, defaultName: string): Promise<StoredProfile> {
    const existing = await this.findById(userId);
    if (existing) return existing;
    const { error } = await this.client.from("v2_profiles").upsert(
      { id: userId, name: defaultName },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw new DataSourceError("Não foi possível criar o perfil público.");
    const created = await this.findById(userId);
    if (!created) throw new DataSourceError("Não foi possível criar o perfil público.");
    return created;
  }
}
