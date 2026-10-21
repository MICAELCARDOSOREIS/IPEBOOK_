import type { IProfileDataSource, ProfileUpdate, StoredProfile } from "@/model/datasources/iProfileDataSource";
import { DataSourceError } from "@/model/errors";

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

  async update(userId: string, patch: ProfileUpdate): Promise<StoredProfile> {
    const existing = this.profiles.get(userId);
    if (!existing) throw new DataSourceError("Perfil não encontrado.");
    const updated: StoredProfile = { ...existing, ...patch };
    this.profiles.set(userId, updated);
    return { ...updated };
  }
}
