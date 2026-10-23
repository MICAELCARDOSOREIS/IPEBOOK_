import type { BlockedUser } from "@/model/entities/blockedUser";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DataSourceError } from "@/model/errors";

/**
 * Persistência remota de bloqueios em v2_blocked_users (Spec 056 / ADR 0039).
 */
export class SupabaseBlockedUserDataSource implements IBlockedUserDataSource {
  constructor(
    private readonly client: SupabaseAppClient,
    private readonly profileDataSource?: IProfileDataSource
  ) {}

  async listBlocked(blockerId: string): Promise<readonly BlockedUser[]> {
    const { data, error } = await this.client
      .from("v2_blocked_users")
      .select("blocked_id, created_at")
      .eq("blocker_id", blockerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DataSourceError("Não foi possível carregar a lista de pessoas bloqueadas.");
    }

    const items: BlockedUser[] = [];
    for (const row of (data as Array<{ blocked_id: string; created_at: string }>) ?? []) {
      let name = "Membro da comunidade";
      let photoUrl: string | undefined;
      if (this.profileDataSource) {
        try {
          const profile = await this.profileDataSource.findById(row.blocked_id);
          if (profile?.name) name = profile.name;
          if (profile?.photoUrl) photoUrl = profile.photoUrl;
        } catch {
          // Fallback gracioso caso a leitura do perfil falhe
        }
      }
      items.push({
        userId: row.blocked_id,
        name,
        blockedAt: row.created_at,
        photoUrl,
      });
    }

    return items;
  }

  async block(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await this.client.from("v2_blocked_users").insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });
    if (error && error.code !== "23505") {
      throw new DataSourceError("Não foi possível bloquear o usuário.");
    }
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_blocked_users")
      .delete()
      .eq("blocker_id", blockerId)
      .eq("blocked_id", blockedId);
    if (error) {
      throw new DataSourceError("Não foi possível desbloquear o usuário.");
    }
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("v2_blocked_users")
      .select("blocker_id")
      .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
      .limit(1);

    if (error) {
      return false;
    }
    return Boolean(data && (data as unknown[]).length > 0);
  }
}
