import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { CreateReportInput, CreateUserReportInput, ReportListing, ReportUser } from "@/model/entities/report";
import { DuplicateReportError } from "@/model/errors";

export class MemoryReportDataSource implements IReportDataSource {
  private readonly reports: ReportListing[] = [];
  private readonly userReports: ReportUser[] = [];

  constructor(initial: readonly ReportListing[] = []) {
    this.reports = initial.map((r) => ({ ...r }));
  }

  async create(input: CreateReportInput): Promise<ReportListing> {
    const duplicate = this.reports.find(
      (r) => r.listingId === input.listingId && r.reporterId === input.reporterId,
    );
    if (duplicate) {
      throw new DuplicateReportError("Você já denunciou este anúncio.");
    }

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

  async createUserReport(input: CreateUserReportInput): Promise<ReportUser> {
    if (this.userReports.some((r) => r.reporterId === input.reporterId && r.reportedUserId === input.reportedUserId)) {
      throw new DuplicateReportError("Você já denunciou esta pessoa.");
    }
    const report: ReportUser = {
      id: `user-report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reportedUserId: input.reportedUserId,
      reporterId: input.reporterId,
      reason: input.reason,
      details: input.details,
      createdAt: new Date().toISOString(),
    };
    this.userReports.push({ ...report });
    return { ...report };
  }

  async listByListing(listingId: string): Promise<readonly ReportListing[]> {
    return this.reports
      .filter((r) => r.listingId === listingId)
      .map((r) => ({ ...r }));
  }

  async listByReporter(userId: string): Promise<readonly ReportListing[]> {
    return this.reports.filter((report) => report.reporterId === userId).map((report) => ({ ...report }));
  }
}
