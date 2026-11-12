import type { BetaTesterSignup } from "@/model/entities/betaTester";

export interface IBetaTesterDataSource {
  /** Grava a inscrição; repetir o mesmo e-mail não é erro. */
  register(signup: BetaTesterSignup): Promise<void>;
}
