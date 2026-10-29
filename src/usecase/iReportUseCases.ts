import type { ReportListing, ReportReason } from "@/model/entities/report";

export interface SubmitReportInput {
  readonly listingId: string;
  readonly reason: ReportReason;
  readonly details?: string;
}

export interface IReportUseCases {
  submitReport(input: SubmitReportInput, sessionUserId: string | null): Promise<ReportListing>;
}
