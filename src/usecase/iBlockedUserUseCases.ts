import type { BlockedUser } from "@/model/entities/blockedUser";

export interface IBlockedUserUseCases {
  listBlockedUsers(sessionUserId: string | null): Promise<readonly BlockedUser[]>;
  blockUser(sessionUserId: string | null, targetUserId: string): Promise<void>;
  unblockUser(sessionUserId: string | null, targetUserId: string): Promise<void>;
  isBlocked(userA: string, userB: string): Promise<boolean>;
}
