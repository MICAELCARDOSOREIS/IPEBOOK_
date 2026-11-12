import type { PiripiriNeighborhood } from "@/model/entities/location";
import type { NotificationType } from "@/model/entities/notification";

export type UserPreferences = Readonly<{
  userId: string;
  phone?: string;
  neighborhood?: PiripiriNeighborhood;
  pushToken?: string | null;
  /** Tipos de aviso que a pessoa não quer receber por push (Spec 099). Vazio = recebe tudo. */
  mutedTypes?: readonly NotificationType[];
}>;

export type UserPreferencesEdits = Readonly<{
  phone?: string;
  neighborhood?: string;
  pushToken?: string | null;
  mutedTypes?: readonly NotificationType[];
}>;
