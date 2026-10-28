import type { ModerationDecision, ModerationItem } from "@/model/entities/moderation";

export interface IModerationUseCases {
  isModerator(sessionUserId: string | null): Promise<boolean>;
  listQueue(sessionUserId: string | null): Promise<readonly ModerationItem[]>;
  decide(item: ModerationItem, decision: ModerationDecision, sessionUserId: string | null, note?: string): Promise<void>;
}
