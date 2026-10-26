import type {
  IUserPreferencesDataSource,
  StoredUserPreferences,
  UserPreferencesUpdate,
} from "@/model/datasources/iUserPreferencesDataSource";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import type { UserPreferences, UserPreferencesEdits } from "@/model/entities/userPreferences";
import { ValidationError } from "@/model/errors";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";

function toPreferences(stored: StoredUserPreferences): UserPreferences {
  return {
    userId: stored.userId,
    phone: stored.phone,
    neighborhood: isKnownNeighborhood(stored.neighborhood) ? stored.neighborhood : undefined,
    ...(stored.pushToken !== undefined ? { pushToken: stored.pushToken } : {}),
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

    let phoneToSave: string | undefined;
    let neighborhoodToSave: string | undefined;

    const existing =
      edits.phone === undefined || edits.neighborhood === undefined || edits.pushToken === undefined
        ? await this.preferences.findById(userId)
        : null;

    if (edits.phone !== undefined) {
      const phoneDigits = edits.phone.replace(/\D/g, "");
      if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
        throw new ValidationError("Informe um telefone válido com DDD.");
      }
      phoneToSave = phoneDigits || undefined;
    } else {
      phoneToSave = existing?.phone;
    }

    if (edits.neighborhood !== undefined) {
      const neighborhood = edits.neighborhood.trim() || undefined;
      if (neighborhood && !isKnownNeighborhood(neighborhood)) {
        throw new ValidationError("Selecione um bairro válido de Piripiri.");
      }
      neighborhoodToSave = neighborhood;
    } else {
      neighborhoodToSave = existing?.neighborhood;
    }

    const patch: UserPreferencesUpdate = {
      phone: phoneToSave,
      neighborhood: neighborhoodToSave,
      pushToken: edits.pushToken !== undefined ? edits.pushToken : existing?.pushToken,
    };

    const updated = await this.preferences.upsert(userId, patch);
    return toPreferences(updated);
  }
}
