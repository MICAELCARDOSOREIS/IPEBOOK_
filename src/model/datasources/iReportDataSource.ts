import type { CreateReportInput, ReportListing } from "@/model/entities/report";

export interface IReportDataSource {
  create(input: CreateReportInput): Promise<ReportListing>;
  listByListing(listingId: string): Promise<readonly ReportListing[]>;
}
