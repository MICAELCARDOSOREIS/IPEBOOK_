/** Alvo de denúncias na fila da moderação (Spec 102 / ADR 0078). */
export type ModerationTargetKind = "listing" | "user";

export type ModerationDecision = "dismiss" | "remove_listing" | "suspend_user";

export type ModerationItem = Readonly<{
  kind: ModerationTargetKind;
  targetId: string;
  /** Título do anúncio ou nome da pessoa denunciada. */
  label: string;
  /** Quem anunciou (anúncio) ou a própria pessoa (perfil). */
  ownerId: string;
  reasons: readonly string[];
  details: readonly string[];
  reportCount: number;
  firstReportedAt: string;
}>;

/** Rótulos das razões das denúncias de anúncio (Spec 011) e de pessoa (Spec 091). */
export const REPORT_REASON_LABEL: Record<string, string> = {
  inappropriate_content: "Conteúdo impróprio",
  fraud_or_scam: "Golpe ou fraude",
  piracy_or_copyright: "Pirataria",
  misleading_info: "Informação enganosa",
  abusive_behavior: "Comportamento abusivo",
  fake_profile: "Perfil falso",
  other: "Outro motivo",
};
