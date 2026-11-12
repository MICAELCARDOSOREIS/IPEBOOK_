import { describe, expect, it, vi } from "vitest";
import { SupabaseReportDataSource } from "@/infra/datasources/supabaseReportDataSource";
import { DataSourceError, DuplicateReportError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(tableImpl: unknown): SupabaseAppClient {
  return {
    from: vi.fn().mockReturnValue(tableImpl),
  } as unknown as SupabaseAppClient;
}

describe("SupabaseReportDataSource (Issue #112)", () => {
  it("cria denúncia com sucesso", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "rep-1",
        listing_id: "book-1",
        reporter_id: "user-1",
        reason: "fraud_or_scam",
        details: "Anúncio falso",
        created_at: "2026-10-20T10:00:00Z",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const client = fakeClient({ insert });

    const ds = new SupabaseReportDataSource(client);
    const report = await ds.create({
      listingId: "book-1",
      reporterId: "user-1",
      reason: "fraud_or_scam",
      details: "Anúncio falso",
    });

    expect(report.id).toBe("rep-1");
    expect(report.listingId).toBe("book-1");
    expect(report.reporterId).toBe("user-1");
    expect(report.reason).toBe("fraud_or_scam");
    expect(report.details).toBe("Anúncio falso");
  });

  it("lança DuplicateReportError quando o banco retorna violação de unicidade (código 23505)", async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key value violates unique constraint" },
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const client = fakeClient({ insert });

    const ds = new SupabaseReportDataSource(client);
    await expect(
      ds.create({
        listingId: "book-1",
        reporterId: "user-1",
        reason: "inappropriate_content",
      }),
    ).rejects.toThrow(DuplicateReportError);

    await expect(
      ds.create({
        listingId: "book-1",
        reporterId: "user-1",
        reason: "inappropriate_content",
      }),
    ).rejects.toThrow("Você já denunciou este anúncio.");
  });

  it("lança DataSourceError genérico para outros erros de banco", async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "50000", message: "internal db error" },
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const client = fakeClient({ insert });

    const ds = new SupabaseReportDataSource(client);
    await expect(
      ds.create({
        listingId: "book-1",
        reporterId: "user-1",
        reason: "other",
      }),
    ).rejects.toThrow(DataSourceError);
  });

  it("lista denúncias filtrando por listingId", async () => {
    const eq = vi.fn().mockResolvedValue({
      data: [
        {
          id: "rep-1",
          listing_id: "book-1",
          reporter_id: "user-1",
          reason: "other",
          details: null,
          created_at: "2026-10-20T10:00:00Z",
        },
      ],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseReportDataSource(client);
    const reports = await ds.listByListing("book-1");
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe("rep-1");
  });

  it("cria denúncia de pessoa com sucesso e trata duplicidade (23505) e erro genérico", async () => {
    const singleOk = vi.fn().mockResolvedValue({
      data: {
        id: "urep-1",
        reporter_id: "user-1",
        reported_user_id: "user-2",
        reason: "abusive_behavior",
        details: "Comportamento ofensivo",
        created_at: "2026-10-27T10:00:00Z",
      },
      error: null,
    });
    const dsOk = new SupabaseReportDataSource(
      fakeClient({ insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: singleOk }) }) }),
    );
    const userReport = await dsOk.createUserReport({
      reporterId: "user-1",
      reportedUserId: "user-2",
      reason: "abusive_behavior",
      details: "Comportamento ofensivo",
    });
    expect(userReport.id).toBe("urep-1");
    expect(userReport.reportedUserId).toBe("user-2");
    expect(userReport.details).toBe("Comportamento ofensivo");

    const singleDup = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate" },
    });
    const dsDup = new SupabaseReportDataSource(
      fakeClient({ insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: singleDup }) }) }),
    );
    await expect(
      dsDup.createUserReport({ reporterId: "user-1", reportedUserId: "user-2", reason: "other" }),
    ).rejects.toThrow("Você já denunciou esta pessoa.");

    const singleErr = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "50000", message: "db error" },
    });
    const dsErr = new SupabaseReportDataSource(
      fakeClient({ insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: singleErr }) }) }),
    );
    await expect(
      dsErr.createUserReport({ reporterId: "user-1", reportedUserId: "user-2", reason: "other" }),
    ).rejects.toThrow(DataSourceError);

    const eqErr = vi.fn().mockResolvedValue({ data: null, error: { message: "erro listagem" } });
    const dsListErr = new SupabaseReportDataSource(fakeClient({ select: vi.fn().mockReturnValue({ eq: eqErr }) }));
    await expect(dsListErr.listByListing("book-1")).rejects.toThrow("Não foi possível listar as denúncias.");
  });
});
