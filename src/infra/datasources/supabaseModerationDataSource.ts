import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IModerationDataSource } from "@/model/datasources/iModerationDataSource";
import type { ModerationDecision, ModerationItem, ModerationTargetKind } from "@/model/entities/moderation";
import { DataSourceError } from "@/model/errors";

type QueueRow = {
  kind: ModerationTargetKind;
  target_id: string;
  target_label: string | null;
  owner_id: string;
  reasons: string[] | null;
  details: string[] | null;
  report_count: number | string;
  first_reported_at: string;
};

/** Moderação pelas RPCs `v2_*` da migração `202610290001_moderacao.sql` (Spec 102 / ADR 0078). */
export class SupabaseModerationDataSource implements IModerationDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async isModerator(): Promise<boolean> {
    const { data, error } = await this.client.rpc("v2_is_moderator");
    if (error) return false;
    return data === true;
  }

  async listQueue(): Promise<readonly ModerationItem[]> {
    const { data, error } = await this.client.rpc("v2_moderation_queue");
    if (error) throw new DataSourceError("Não foi possível carregar as denúncias.");
    return ((data as QueueRow[] | null) ?? []).map((row) => ({
      kind: row.kind,
      targetId: row.target_id,
      label: row.target_label ?? "Sem título",
      ownerId: row.owner_id,
      reasons: row.reasons ?? [],
      details: row.details ?? [],
      reportCount: Number(row.report_count),
      firstReportedAt: row.first_reported_at,
    }));
  }

  async resolve(kind: ModerationTargetKind, targetId: string, decision: ModerationDecision, note?: string): Promise<void> {
    const { error } = await this.client.rpc("v2_moderation_resolve", {
      target_kind: kind,
      target: targetId,
      decision,
      note: note ?? null,
    });
    if (error) throw new DataSourceError("Não foi possível registrar a decisão.");
  }
}
