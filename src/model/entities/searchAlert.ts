import type { BookModality } from "@/model/entities/book";

/** Modalidades que um alerta acompanha; alertas antigos valem para as três (Spec 036). */
export const ALL_ALERT_MODALITIES: readonly BookModality[] = ["sale", "trade", "donation"];

export type SearchAlert = Readonly<{
  id: string;
  userId: string;
  query: string;
  active: boolean;
  createdAt: string;
  modalities: readonly BookModality[];
}>;
