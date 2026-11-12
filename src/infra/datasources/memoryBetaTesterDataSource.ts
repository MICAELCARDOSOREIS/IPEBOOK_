import type { IBetaTesterDataSource } from "@/model/datasources/iBetaTesterDataSource";
import type { BetaTesterSignup } from "@/model/entities/betaTester";

export class MemoryBetaTesterDataSource implements IBetaTesterDataSource {
  private readonly signups: BetaTesterSignup[] = [];

  async register(signup: BetaTesterSignup): Promise<void> {
    if (this.signups.some((s) => s.email === signup.email)) return;
    this.signups.push({ ...signup });
  }

  list(): readonly BetaTesterSignup[] {
    return this.signups.map((s) => ({ ...s }));
  }
}
