import type { IProfileDataSource, ProfileUpdate, StoredProfile } from "@/model/datasources/iProfileDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type ProfileRow = {
  id: string;
  name: string;
  created_at: string;
  photo_url: string | null;
  social_handle: string | null;
};

function mapProfile(row: ProfileRow): StoredProfile {
  return {
    userId: row.id,
    name: row.name,
    joinedAt: row.created_at,
    photoUrl: row.photo_url ?? undefined,
    socialHandle: row.social_handle ?? undefined,
  };
}

const columns = "id,name,created_at,photo_url,social_handle";

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

  async update(userId: string, patch: ProfileUpdate): Promise<StoredProfile> {
    const { error } = await this.client
      .from("v2_profiles")
      .update({ name: patch.name, photo_url: patch.photoUrl ?? null, social_handle: patch.socialHandle ?? null })
      .eq("id", userId);
    if (error) throw new DataSourceError("Não foi possível atualizar o perfil.");
    const updated = await this.findById(userId);
    if (!updated) throw new DataSourceError("Não foi possível atualizar o perfil.");
    return updated;
  }
}
