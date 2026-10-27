import { describe, expect, it } from "vitest";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { ReportUseCases } from "@/usecase/reportUseCases";

describe("ReportUseCases.submitUserReport (Spec 091)", () => {
  const make = () => new ReportUseCases(new MemoryReportDataSource());

  it("registra a denúncia de outra pessoa", async () => {
    const report = await make().submitUserReport({ reportedUserId: "ana", reason: "fake_profile", details: "  usa foto de outra pessoa " }, "me");
    expect(report).toMatchObject({ reportedUserId: "ana", reporterId: "me", reason: "fake_profile" });
  });

  it("exige sessão, motivo e pessoa diferente de quem denuncia", async () => {
    const uc = make();
    await expect(uc.submitUserReport({ reportedUserId: "ana", reason: "other" }, null)).rejects.toThrow(/autenticado/);
    await expect(uc.submitUserReport({ reportedUserId: "me", reason: "other" }, "me")).rejects.toThrow(/si mesmo/);
    await expect(uc.submitUserReport({ reportedUserId: "ana", reason: undefined as never }, "me")).rejects.toThrow(/motivo/);
  });

  it("recusa denúncia repetida da mesma pessoa e detalhes longos demais", async () => {
    const uc = make();
    await uc.submitUserReport({ reportedUserId: "ana", reason: "other" }, "me");
    await expect(uc.submitUserReport({ reportedUserId: "ana", reason: "other" }, "me")).rejects.toThrow(/já denunciou/);
    await expect(uc.submitUserReport({ reportedUserId: "caio", reason: "other", details: "x".repeat(501) }, "me")).rejects.toThrow(/500/);
  });
});
