import type { IProfileDataSource, StoredProfile } from "@/model/datasources/iProfileDataSource";

export class MemoryProfileDataSource implements IProfileDataSource {
  private readonly profiles = new Map<string, StoredProfile>();

  async findById(userId: string): Promise<StoredProfile | null> {
    const found = this.profiles.get(userId);
    return found ? { ...found } : null;
  }

  async ensure(userId: string, defaultName: string): Promise<StoredProfile> {
    const existing = this.profiles.get(userId);
    if (existing) return { ...existing };
    const created: StoredProfile = { userId, name: defaultName, joinedAt: new Date().toISOString() };
    this.profiles.set(userId, created);
    return { ...created };
  }
}
