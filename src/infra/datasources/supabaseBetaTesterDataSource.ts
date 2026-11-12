import { toDomainError } from "@/infra/supabaseErrors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IBetaTesterDataSource } from "@/model/datasources/iBetaTesterDataSource";
import type { BetaTesterSignup } from "@/model/entities/betaTester";

export class SupabaseBetaTesterDataSource implements IBetaTesterDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async register(signup: BetaTesterSignup): Promise<void> {
    const { error } = await this.client.rpc("v2_register_beta_tester", {
      p_email: signup.email,
      p_name: signup.name ?? null,
    });
    if (error) {
      throw toDomainError(error, "Não foi possível registrar sua inscrição. Tente de novo.");
    }
  }
}
