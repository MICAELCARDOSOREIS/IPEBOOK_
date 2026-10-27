import type { ReportListing, ReportReason, ReportUser, UserReportReason } from "@/model/entities/report";

export interface SubmitReportInput {
  readonly listingId: string;
  readonly reason: ReportReason;
  readonly details?: string;
}

export interface SubmitUserReportInput {
  readonly reportedUserId: string;
  readonly reason: UserReportReason;
  readonly details?: string;
}

export interface IReportUseCases {
  submitUserReport(input: SubmitUserReportInput, sessionUserId: string | null): Promise<ReportUser>;
  submitReport(input: SubmitReportInput, sessionUserId: string | null): Promise<ReportListing>;
}
