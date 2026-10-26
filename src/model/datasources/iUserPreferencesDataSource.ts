export type StoredUserPreferences = Readonly<{
  userId: string;
  phone?: string;
  neighborhood?: string;
  pushToken?: string | null;
}>;

export type UpdateUserPreferencesDTO = Readonly<{
  phone?: string;
  neighborhood?: string;
  pushToken?: string | null;
}>;

export type UserPreferencesUpdate = UpdateUserPreferencesDTO;

export interface IUserPreferencesDataSource {
  findById(userId: string): Promise<StoredUserPreferences | null>;
  upsert(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences>;
  upsertPreferences?(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences>;
}
