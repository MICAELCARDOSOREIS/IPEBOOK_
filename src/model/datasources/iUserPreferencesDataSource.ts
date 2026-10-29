export type StoredUserPreferences = Readonly<{
  userId: string;
  phone?: string;
  neighborhood?: string;
}>;

export type UserPreferencesUpdate = Readonly<{
  phone?: string;
  neighborhood?: string;
}>;

export interface IUserPreferencesDataSource {
  findById(userId: string): Promise<StoredUserPreferences | null>;
  upsert(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences>;
}
