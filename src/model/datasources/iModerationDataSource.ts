import type { ModerationDecision, ModerationItem, ModerationTargetKind } from "@/model/entities/moderation";

/** Contrato da moderação (Spec 102 / ADR 0078); o servidor confere se quem chama é moderador. */
export interface IModerationDataSource {
  isModerator(): Promise<boolean>;
  listQueue(): Promise<readonly ModerationItem[]>;
  resolve(kind: ModerationTargetKind, targetId: string, decision: ModerationDecision, note?: string): Promise<void>;
}
