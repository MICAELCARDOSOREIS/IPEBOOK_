import type { UserPreferences, UserPreferencesEdits } from "@/model/entities/userPreferences";

export interface IUserPreferencesUseCases {
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, edits: UserPreferencesEdits): Promise<UserPreferences>;
}
