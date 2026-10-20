import type { IOnboardingDataSource } from "@/model/datasources/iOnboardingDataSource";
import type { IOnboardingUseCases } from "@/usecase/iOnboardingUseCases";

export class OnboardingUseCases implements IOnboardingUseCases {
  constructor(private readonly onboarding: IOnboardingDataSource) {}

  /**
   * Se o armazenamento falhar na leitura, mostra as boas-vindas: a tela não bloqueia, pois
   * o visitante pode seguir direto para o catálogo a partir dela.
   */
  async shouldShowWelcome() {
    try {
      return !(await this.onboarding.hasSeenWelcome());
    } catch {
      return true;
    }
  }

  /** Falha ao gravar só faz a tela reaparecer na próxima abertura; não impede o uso do app. */
  async markWelcomeSeen() {
    try {
      await this.onboarding.markWelcomeSeen();
    } catch {
      // intencionalmente silencioso (ver comentário acima)
    }
  }
}
