import type { BlockedUser } from "@/model/entities/blockedUser";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import type { IBlockedUserUseCases } from "@/usecase/iBlockedUserUseCases";
import { AuthError, ValidationError } from "@/model/errors";

export class BlockedUserUseCases implements IBlockedUserUseCases {
  constructor(private readonly dataSource: IBlockedUserDataSource) {}

  async listBlockedUsers(sessionUserId: string | null): Promise<readonly BlockedUser[]> {
    if (!sessionUserId) {
      throw new AuthError("Sessão obrigatória para visualizar pessoas bloqueadas.");
    }
    return this.dataSource.listBlocked(sessionUserId);
  }

  async blockUser(sessionUserId: string | null, targetUserId: string): Promise<void> {
    if (!sessionUserId) {
      throw new AuthError("Sessão obrigatória para bloquear um usuário.");
    }
    if (!targetUserId || targetUserId.trim().length === 0) {
      throw new ValidationError("Identificador do usuário a bloquear é obrigatório.");
    }
    if (sessionUserId === targetUserId) {
      throw new ValidationError("Não é possível bloquear a si mesmo.");
    }
    await this.dataSource.block(sessionUserId, targetUserId);
  }

  async unblockUser(sessionUserId: string | null, targetUserId: string): Promise<void> {
    if (!sessionUserId) {
      throw new AuthError("Sessão obrigatória para desbloquear um usuário.");
    }
    if (!targetUserId || targetUserId.trim().length === 0) {
      throw new ValidationError("Identificador do usuário a desbloquear é obrigatório.");
    }
    await this.dataSource.unblock(sessionUserId, targetUserId);
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    if (!userA || !userB) return false;
    return this.dataSource.isBlocked(userA, userB);
  }
}
