import type { ThemePreference } from "@/model/entities/themePreference";

export interface IThemePreferenceUseCases {
  getPreference(): Promise<ThemePreference>;
  setPreference(preference: ThemePreference): Promise<void>;
}
