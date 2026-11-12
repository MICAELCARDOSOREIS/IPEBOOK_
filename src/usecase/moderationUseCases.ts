import type { IModerationDataSource } from "@/model/datasources/iModerationDataSource";
import type { ModerationDecision, ModerationItem } from "@/model/entities/moderation";
import { AuthError, ValidationError } from "@/model/errors";
import type { IModerationUseCases } from "@/usecase/iModerationUseCases";

const RESTRICTED = "Acesso restrito à moderação.";

/** Fila e decisões da moderação (Spec 102 / ADR 0078). O banco repete as mesmas checagens. */
export class ModerationUseCases implements IModerationUseCases {
  constructor(private readonly moderation: IModerationDataSource) {}

  async isModerator(sessionUserId: string | null): Promise<boolean> {
    if (!sessionUserId) return false;
    try {
      return await this.moderation.isModerator();
    } catch {
      return false;
    }
  }

  async listQueue(sessionUserId: string | null): Promise<readonly ModerationItem[]> {
    await this.requireModerator(sessionUserId);
    return this.moderation.listQueue();
  }

  async decide(
    item: ModerationItem,
    decision: ModerationDecision,
    sessionUserId: string | null,
    note?: string,
  ): Promise<void> {
    await this.requireModerator(sessionUserId);
    if (decision === "remove_listing" && item.kind !== "listing") {
      throw new ValidationError("Só é possível remover um anúncio denunciado.");
    }
    await this.moderation.resolve(item.kind, item.targetId, decision, note);
  }

  private async requireModerator(sessionUserId: string | null): Promise<void> {
    if (!sessionUserId || !(await this.moderation.isModerator())) {
      throw new AuthError(RESTRICTED);
    }
  }
}
