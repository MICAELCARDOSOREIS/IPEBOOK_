import type { BlockedUser } from "@/model/entities/blockedUser";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";

/**
 * Persistência em memória de bloqueios para testes e modo offline (Spec 056 / ADR 0039).
 */
export class MemoryBlockedUserDataSource implements IBlockedUserDataSource {
  private readonly records: Array<{ blockerId: string; blockedId: string; createdAt: string }> = [];

  constructor(
    initialRecords: Array<{ blockerId: string; blockedId: string; createdAt?: string }> = [],
    private readonly profileDataSource?: IProfileDataSource
  ) {
    for (const record of initialRecords) {
      this.records.push({
        blockerId: record.blockerId,
        blockedId: record.blockedId,
        createdAt: record.createdAt ?? new Date().toISOString(),
      });
    }
  }

  async listBlocked(blockerId: string): Promise<readonly BlockedUser[]> {
    const userBlocks = this.records.filter((r) => r.blockerId === blockerId);
    const result: BlockedUser[] = [];
    for (const b of userBlocks) {
      let name = "Membro da comunidade";
      let photoUrl: string | undefined;
      if (this.profileDataSource) {
        const prof = await this.profileDataSource.findById(b.blockedId);
        if (prof?.name) name = prof.name;
        if (prof?.photoUrl) photoUrl = prof.photoUrl;
      }
      result.push({
        userId: b.blockedId,
        name,
        blockedAt: b.createdAt,
        photoUrl,
      });
    }
    return result;
  }

  async block(blockerId: string, blockedId: string): Promise<void> {
    const exists = this.records.some(
      (r) => r.blockerId === blockerId && r.blockedId === blockedId
    );
    if (!exists) {
      this.records.push({
        blockerId,
        blockedId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const index = this.records.findIndex(
      (r) => r.blockerId === blockerId && r.blockedId === blockedId
    );
    if (index !== -1) {
      this.records.splice(index, 1);
    }
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    return this.records.some(
      (r) =>
        (r.blockerId === userA && r.blockedId === userB) ||
        (r.blockerId === userB && r.blockedId === userA)
    );
  }
}
