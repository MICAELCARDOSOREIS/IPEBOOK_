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
    key: "inappropriate_content",
    label: "Conteúdo impróprio ou ofensivo",
    description: "Linguagem abusiva, preconceito, incitação à violência ou material impróprio.",
  },
  {
    key: "fraud_or_scam",
    label: "Suspeita de golpe ou fraude",
    description: "Cobrança fora da plataforma, livro inexistente ou conduta suspeita.",
  },
  {
    key: "piracy_or_copyright",
    label: "Cópia pirata ou ilegal",
    description: "Fotocópia não autorizada, impressão pirata ou violação de direitos.",
  },
  {
    key: "misleading_info",
    label: "Informações enganosas",
    description: "Estado de conservação muito divergente, título trocado ou dados falsos.",
  },
  {
    key: "other",
    label: "Outro motivo",
    description: "Outra violação das diretrizes de convivência do Ipebook em Piripiri.",
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
