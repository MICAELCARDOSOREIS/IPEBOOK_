export type ReportReason =
  | "inappropriate_content"
  | "fraud_or_scam"
  | "piracy_or_copyright"
  | "misleading_info"
  | "other";

export interface ReportReasonOption {
  readonly key: ReportReason;
  readonly label: string;
  readonly description: string;
}

export const REPORT_REASONS: readonly ReportReasonOption[] = [
  {
    key: "misleading_info",
    label: "O livro não corresponde à descrição",
    description: "Estado de conservação muito divergente, título trocado ou dados falsos.",
  },
  {
    key: "fraud_or_scam",
    label: "Golpe ou cobrança indevida",
    description: "Cobrança fora da plataforma, livro inexistente ou conduta suspeita.",
  },
  {
    key: "inappropriate_content",
    label: "Conteúdo ofensivo",
    description: "Linguagem abusiva, preconceito, incitação à violência ou material impróprio.",
  },
  {
    key: "piracy_or_copyright",
    label: "Cópia pirata ou ilegal",
    description: "Fotocópia não autorizada, impressão pirata ou violação de direitos.",
  },
  {
    key: "other",
    label: "Outro motivo",
    description: "Outra violação das diretrizes de convivência do IpêBook em Piripiri.",
  },
];

export interface ReportListing {
  readonly id: string;
  readonly listingId: string;
  readonly reporterId: string;
  readonly reason: ReportReason;
  readonly details?: string;
  readonly createdAt: string;
}

export interface CreateReportInput {
  readonly listingId: string;
  readonly reporterId: string;
  readonly reason: ReportReason;
  readonly details?: string;
}

/** Denúncia de pessoa (perfil público, Spec 091). */
export type UserReportReason = "abusive_behavior" | "fraud_or_scam" | "fake_profile" | "other";

export interface UserReportReasonOption {
  readonly key: UserReportReason;
  readonly label: string;
  readonly description: string;
}

export const USER_REPORT_REASONS: readonly UserReportReasonOption[] = [
  { key: "abusive_behavior", label: "Comportamento abusivo", description: "Ofensas, ameaças, assédio ou preconceito." },
  { key: "fraud_or_scam", label: "Golpe ou cobrança indevida", description: "Pede pagamento fora do combinado ou age de má-fé." },
  { key: "fake_profile", label: "Perfil falso", description: "Finge ser outra pessoa ou usa dados falsos." },
  { key: "other", label: "Outro motivo", description: "Outra violação das diretrizes de convivência do IpêBook." },
];

export interface ReportUser {
  readonly id: string;
  readonly reportedUserId: string;
  readonly reporterId: string;
  readonly reason: UserReportReason;
  readonly details?: string;
  readonly createdAt: string;
}

export interface CreateUserReportInput {
  readonly reportedUserId: string;
  readonly reporterId: string;
  readonly reason: UserReportReason;
  readonly details?: string;
}
