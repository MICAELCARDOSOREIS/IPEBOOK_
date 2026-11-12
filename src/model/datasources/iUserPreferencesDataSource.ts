import type { NotificationType } from "@/model/entities/notification";

export type StoredUserPreferences = Readonly<{
  userId: string;
  phone?: string;
  neighborhood?: string;
  pushToken?: string | null;
  mutedTypes?: readonly NotificationType[];
}>;

export type UpdateUserPreferencesDTO = Readonly<{
  phone?: string;
  neighborhood?: string;
  pushToken?: string | null;
  mutedTypes?: readonly NotificationType[];
}>;

export type UserPreferencesUpdate = UpdateUserPreferencesDTO;

export interface IUserPreferencesDataSource {
  findById(userId: string): Promise<StoredUserPreferences | null>;
  upsert(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences>;
  upsertPreferences?(userId: string, patch: UserPreferencesUpdate): Promise<StoredUserPreferences>;
}
