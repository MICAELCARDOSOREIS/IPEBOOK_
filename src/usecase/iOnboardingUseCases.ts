export interface IOnboardingUseCases {
  shouldShowWelcome(): Promise<boolean>;
  markWelcomeSeen(): Promise<void>;
}
