import type { IOnboardingDataSource } from "@/model/datasources/iOnboardingDataSource";

export class MemoryOnboardingDataSource implements IOnboardingDataSource {
  private seen = false;

  async hasSeenWelcome() {
    return this.seen;
  }

  async markWelcomeSeen() {
    this.seen = true;
  }
}
