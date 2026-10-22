import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IThemePreferenceDataSource } from "@/model/datasources/iThemePreferenceDataSource";
import { isThemePreference, type ThemePreference } from "@/model/entities/themePreference";

export const THEME_PREFERENCE_KEY = "ipebook.preferenciaDeTema";

export class AsyncStorageThemePreferenceDataSource implements IThemePreferenceDataSource {
  async getPreference(): Promise<ThemePreference> {
    const stored = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return isThemePreference(stored) ? stored : "system";
  }

  async setPreference(preference: ThemePreference) {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
  }
}
