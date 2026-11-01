import type { IThemePreferenceDataSource } from "@/model/datasources/iThemePreferenceDataSource";
import type { ThemePreference } from "@/model/entities/themePreference";

export class MemoryThemePreferenceDataSource implements IThemePreferenceDataSource {
  private preference: ThemePreference = "light";

  async getPreference() {
    return this.preference;
  }

  async setPreference(preference: ThemePreference) {
    this.preference = preference;
  }
}
