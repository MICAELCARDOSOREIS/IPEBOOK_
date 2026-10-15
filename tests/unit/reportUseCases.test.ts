import { describe, expect, it } from "vitest";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import { ReportUseCases } from "@/usecase/reportUseCases";

describe("ReportUseCases", () => {
  it("lança AuthError quando o usuário não está autenticado", async () => {
    const dataSource = new MemoryReportDataSource();
    const useCases = new ReportUseCases(dataSource);

    await expect(
      useCases.submitReport(
        { listingId: "book-1", reason: "inappropriate_content" },
        null,
      ),
    ).rejects.toThrow(AuthError);
  });

  it("lança ValidationError quando listingId está vazio", async () => {
    const dataSource = new MemoryReportDataSource();
    const useCases = new ReportUseCases(dataSource);

    await expect(
      useCases.submitReport(
        { listingId: "   ", reason: "fraud_or_scam" },
        "user-1",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError quando detalhes excedem 500 caracteres", async () => {
    const dataSource = new MemoryReportDataSource();
    const useCases = new ReportUseCases(dataSource);

    await expect(
      useCases.submitReport(
        {
          listingId: "book-1",
          reason: "other",
          details: "a".repeat(501),
        },
        "user-1",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("registra a denúncia com sucesso", async () => {
    const dataSource = new MemoryReportDataSource();
    const useCases = new ReportUseCases(dataSource);

    const report = await useCases.submitReport(
      {
        listingId: "book-1",
        reason: "inappropriate_content",
        details: "Linguagem ofensiva na descrição.",
      },
      "user-123",
    );

    expect(report.id).toBeDefined();
    expect(report.listingId).toBe("book-1");
    expect(report.reporterId).toBe("user-123");
    expect(report.reason).toBe("inappropriate_content");
    expect(report.details).toBe("Linguagem ofensiva na descrição.");
    expect(report.createdAt).toBeDefined();

    const listingReports = await dataSource.listByListing("book-1");
    expect(listingReports).toHaveLength(1);
    expect(listingReports[0].id).toBe(report.id);
  });
});
