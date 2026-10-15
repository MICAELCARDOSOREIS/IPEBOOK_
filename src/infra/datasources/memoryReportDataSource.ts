import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { CreateReportInput, ReportListing } from "@/model/entities/report";

export class MemoryReportDataSource implements IReportDataSource {
  private readonly reports: ReportListing[] = [];

  constructor(initial: readonly ReportListing[] = []) {
    this.reports = initial.map((r) => ({ ...r }));
  }

  async create(input: CreateReportInput): Promise<ReportListing> {
    const report: ReportListing = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      listingId: input.listingId,
      reporterId: input.reporterId,
      reason: input.reason,
      details: input.details,
      createdAt: new Date().toISOString(),
    };
    this.reports.push({ ...report });
    return { ...report };
  }

  async listByListing(listingId: string): Promise<readonly ReportListing[]> {
    return this.reports
      .filter((r) => r.listingId === listingId)
      .map((r) => ({ ...r }));
  }
}
