import type { IModerationDataSource } from "@/model/datasources/iModerationDataSource";
import type { ModerationDecision, ModerationItem, ModerationTargetKind } from "@/model/entities/moderation";

/** Moderação em memória para testes e modo local (Spec 102). */
export class MemoryModerationDataSource implements IModerationDataSource {
  private queue: ModerationItem[];
  readonly decisions: Array<{ kind: ModerationTargetKind; targetId: string; decision: ModerationDecision; note?: string }> = [];

  constructor(initial: readonly ModerationItem[] = [], private readonly moderator = false) {
    this.queue = [...initial];
  }

  async isModerator(): Promise<boolean> {
    return this.moderator;
  }

  async listQueue(): Promise<readonly ModerationItem[]> {
    return [...this.queue];
  }

  async resolve(kind: ModerationTargetKind, targetId: string, decision: ModerationDecision, note?: string): Promise<void> {
    this.decisions.push({ kind, targetId, decision, note });
    this.queue = this.queue.filter((item) => !(item.kind === kind && item.targetId === targetId));
  }
}
