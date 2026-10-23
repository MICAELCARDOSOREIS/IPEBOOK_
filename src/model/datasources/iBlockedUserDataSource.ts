import type { BlockedUser } from "@/model/entities/blockedUser";

/**
 * Contrato de persistência para bloqueios de usuário (Spec 056 / ADR 0039).
 */
export interface IBlockedUserDataSource {
  listBlocked(blockerId: string): Promise<readonly BlockedUser[]>;
  block(blockerId: string, blockedId: string): Promise<void>;
  unblock(blockerId: string, blockedId: string): Promise<void>;
  isBlocked(userA: string, userB: string): Promise<boolean>;
}
