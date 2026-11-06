import { toDomainError } from "@/infra/supabaseErrors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IAppVersionPolicyDataSource } from "@/model/datasources/iAppVersionPolicyDataSource";
import type { AppVersionPolicy } from "@/model/entities/appUpdate";

type PolicyRow = {
  platform: "android";
  latest_version: string;
  min_supported_version: string;
  release_notes: string | null;
  store_url: string;
};

export class SupabaseAppVersionPolicyDataSource implements IAppVersionPolicyDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async getPolicy(): Promise<AppVersionPolicy | null> {
    const { data, error } = await this.client
      .from("v2_app_version_policy")
      .select("platform, latest_version, min_supported_version, release_notes, store_url")
      .eq("platform", "android")
      .maybeSingle();
    if (error) throw toDomainError(error, "Não foi possível verificar atualizações.");
    if (!data) return null;
    const row = data as PolicyRow;
    return {
      platform: row.platform,
      latestVersion: row.latest_version,
      minSupportedVersion: row.min_supported_version,
      releaseNotes: row.release_notes,
      storeUrl: row.store_url,
    };
  }
}
