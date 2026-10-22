import type { ThemePreference } from "@/model/entities/themePreference";

/** Preferência de tema guardada no dispositivo (ADR 0036). Não é compartilhada entre contas. */
export interface IThemePreferenceDataSource {
  getPreference(): Promise<ThemePreference>;
  setPreference(preference: ThemePreference): Promise<void>;
}
