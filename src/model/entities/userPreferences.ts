import type { PiripiriNeighborhood } from "@/model/entities/location";

export type UserPreferences = Readonly<{
  userId: string;
  phone?: string;
  neighborhood?: PiripiriNeighborhood;
}>;

export type UserPreferencesEdits = Readonly<{
  phone?: string;
  neighborhood?: string;
}>;
