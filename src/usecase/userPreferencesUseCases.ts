import type { IUserPreferencesDataSource } from "@/model/datasources/iUserPreferencesDataSource";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import type { UserPreferences, UserPreferencesEdits } from "@/model/entities/userPreferences";
import { ValidationError } from "@/model/errors";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";

function toPreferences(stored: { userId: string; phone?: string; neighborhood?: string }): UserPreferences {
  return {
    userId: stored.userId,
    phone: stored.phone,
    neighborhood: isKnownNeighborhood(stored.neighborhood) ? stored.neighborhood : undefined,
  };
}

function isKnownNeighborhood(value: string | undefined): value is UserPreferences["neighborhood"] {
  return value !== undefined && (PIRIPIRI_NEIGHBORHOODS as readonly string[]).includes(value);
}

export class UserPreferencesUseCases implements IUserPreferencesUseCases {
  constructor(private readonly preferences: IUserPreferencesDataSource) {}

  async getPreferences(userId: string): Promise<UserPreferences> {
    if (!userId) throw new ValidationError("Usuário não encontrado.");
    const stored = await this.preferences.findById(userId);
    return stored ? toPreferences(stored) : { userId };
  }

  async updatePreferences(userId: string, edits: UserPreferencesEdits): Promise<UserPreferences> {
    if (!userId) throw new ValidationError("Usuário não encontrado.");

    const phoneDigits = edits.phone?.replace(/\D/g, "");
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      throw new ValidationError("Informe um telefone válido com DDD.");
    }

    const neighborhood = edits.neighborhood?.trim() || undefined;
    if (neighborhood && !isKnownNeighborhood(neighborhood)) {
      throw new ValidationError("Selecione um bairro válido de Piripiri.");
    }

    const updated = await this.preferences.upsert(userId, { phone: phoneDigits || undefined, neighborhood });
    return toPreferences(updated);
  }
}
