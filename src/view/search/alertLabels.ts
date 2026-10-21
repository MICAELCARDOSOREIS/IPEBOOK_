import type { BookModality } from "@/model/entities/book";
import { ALL_ALERT_MODALITIES } from "@/model/entities/searchAlert";

/** Única cidade atendida pela plataforma (Spec 022); o campo de `02.10` é só contexto. */
export const ALERT_CITY = "Piripiri, PI";

export const ALERT_MODALITY_LABELS: Record<BookModality, string> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

/**
 * Resume as modalidades do alerta como em `02.07` e `02.09`: "Venda, troca e doação" quando são
 * todas, ou a lista do que foi escolhido.
 */
export function ALERT_MODALITY_SUMMARY(modalities: readonly BookModality[]): string {
  const chosen = ALL_ALERT_MODALITIES.filter((modality) => modalities.includes(modality));
  if (chosen.length === 0) return "Nenhum tipo selecionado";
  const labels = chosen.map((modality, index) =>
    index === 0
      ? ALERT_MODALITY_LABELS[modality]
      : ALERT_MODALITY_LABELS[modality].toLocaleLowerCase("pt-BR"),
  );
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}
