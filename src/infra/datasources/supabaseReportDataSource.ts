import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { CreateReportInput, CreateUserReportInput, ReportListing, ReportUser } from "@/model/entities/report";
import { toDomainError } from "@/infra/supabaseErrors";
import { DataSourceError, DuplicateReportError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type ReportRow = {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportListing["reason"];
  details: string | null;
  created_at: string;
};

function mapReport(row: ReportRow): ReportListing {
  return {
    id: row.id,
    listingId: row.listing_id,
    reporterId: row.reporter_id,
    reason: row.reason,
    ...(row.details ? { details: row.details } : {}),
    createdAt: row.created_at,
  };
}

export class SupabaseReportDataSource implements IReportDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async create(input: CreateReportInput): Promise<ReportListing> {
    const { data, error } = await this.client
      .from("v2_reports")
      .insert({
        listing_id: input.listingId,
        reporter_id: input.reporterId,
        reason: input.reason,
        details: input.details ?? null,
      })
      .select("id,listing_id,reporter_id,reason,details,created_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new DuplicateReportError("Você já denunciou este anúncio.");
      }
      throw toDomainError(error, "Não foi possível registrar a denúncia.");
    }
    return mapReport(data as ReportRow);
  }

  async createUserReport(input: CreateUserReportInput): Promise<ReportUser> {
    const { data, error } = await this.client
      .from("v2_user_reports")
      .insert({
        reporter_id: input.reporterId,
        reported_user_id: input.reportedUserId,
        reason: input.reason,
        details: input.details ?? null,
      })
      .select("id,reporter_id,reported_user_id,reason,details,created_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new DuplicateReportError("Você já denunciou esta pessoa.");
      }
      throw toDomainError(error, "Não foi possível registrar a denúncia.");
    }
    const row = data as {
      id: string;
      reporter_id: string;
      reported_user_id: string;
      reason: ReportUser["reason"];
      details: string | null;
      created_at: string;
    };
    return {
      id: row.id,
      reportedUserId: row.reported_user_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      ...(row.details ? { details: row.details } : {}),
      createdAt: row.created_at,
    };
  }

  async listByListing(listingId: string): Promise<readonly ReportListing[]> {
    const { data, error } = await this.client
      .from("v2_reports")
      .select("id,listing_id,reporter_id,reason,details,created_at")
      .eq("listing_id", listingId);

    if (error) {
      throw new DataSourceError("Não foi possível listar as denúncias.");
    }
    return (data as ReportRow[]).map(mapReport);
  }
}
