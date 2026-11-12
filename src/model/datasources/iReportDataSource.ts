import type { CreateReportInput, CreateUserReportInput, ReportListing, ReportUser } from "@/model/entities/report";

export interface IReportDataSource {
  create(input: CreateReportInput): Promise<ReportListing>;
  createUserReport(input: CreateUserReportInput): Promise<ReportUser>;
  listByListing(listingId: string): Promise<readonly ReportListing[]>;
}
