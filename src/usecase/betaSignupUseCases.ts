import type { IBetaTesterDataSource } from "@/model/datasources/iBetaTesterDataSource";
import { ValidationError } from "@/model/errors";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";
import type { BetaSignupInput, IBetaSignupUseCases } from "@/usecase/iBetaSignupUseCases";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class BetaSignupUseCases implements IBetaSignupUseCases {
  constructor(private readonly dataSource: IBetaTesterDataSource) {}

  async register(input: BetaSignupInput): Promise<void> {
    const email = (input.email ?? "").trim().toLowerCase();
    if (!email) {
      throw new ValidationError("Informe seu Gmail.");
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      throw new ValidationError("Informe um e-mail válido.");
    }

    const name = input.name ? sanitizeTextInput(input.name).trim() : "";
    if (name.length > 80) {
      throw new ValidationError("O nome deve ter no máximo 80 caracteres.");
    }

    await this.dataSource.register({ email, ...(name ? { name } : {}) });
  }
}
