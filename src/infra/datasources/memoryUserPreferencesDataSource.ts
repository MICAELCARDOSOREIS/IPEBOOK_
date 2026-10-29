import type {
  IUserPreferencesDataSource,
  StoredUserPreferences,
  UserPreferencesUpdate,
} from "@/model/datasources/iUserPreferencesDataSource";

export class MemoryUserPreferencesDataSource implements IUserPreferencesDataSource {
  private readonly preferences = new Map<string, StoredUserPreferences>();

  async findById(userId: string): Promise<StoredUserPreferences | null> {
    const found = this.preferences.get(userId);
    return found ? { ...found } : null;
  }

  async upsert(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences> {
    const existing = this.preferences.get(userId);
    const updated: StoredUserPreferences = { userId, ...existing, ...patch };
    this.preferences.set(userId, updated);
    return { ...updated };
  }
}
