import type { IThemePreferenceDataSource } from "@/model/datasources/iThemePreferenceDataSource";
import type { ThemePreference } from "@/model/entities/themePreference";
import type { IThemePreferenceUseCases } from "@/usecase/iThemePreferenceUseCases";

export class ThemePreferenceUseCases implements IThemePreferenceUseCases {
  constructor(private readonly themePreference: IThemePreferenceDataSource) {}

  /** Se o armazenamento falhar na leitura, segue o tema do sistema: nunca trava a tela. */
  async getPreference(): Promise<ThemePreference> {
    try {
      return await this.themePreference.getPreference();
    } catch {
      return "system";
    }
  }

  /** Falha ao gravar só faz a preferência não persistir entre sessões; não impede o uso do app. */
  async setPreference(preference: ThemePreference): Promise<void> {
    try {
      await this.themePreference.setPreference(preference);
    } catch {
      // intencionalmente silencioso (ver comentário acima)
    }
  }
}
