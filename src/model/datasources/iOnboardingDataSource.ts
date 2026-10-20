/** Estado de primeiro acesso guardado no dispositivo (ADR 0022). Não é compartilhado entre contas. */
export interface IOnboardingDataSource {
  hasSeenWelcome(): Promise<boolean>;
  markWelcomeSeen(): Promise<void>;
}
