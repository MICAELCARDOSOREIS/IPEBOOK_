import { describe, expect, it } from "vitest";
import { FileDownloadService } from "@/infra/services/fileDownloadService";

describe("FileDownloadService (Spec 029 - LGPD Portabilidade)", () => {
  it("executa download de dados em formato JSON com sucesso", async () => {
    const service = new FileDownloadService();
    const result = await service.downloadJson("dados-teste.json", {
      usuario: "teste",
      dados: [1, 2, 3],
    });
    expect(result).toBe(true);
  });

  it("trata dados inválidos sem lançar exceções não tratadas", async () => {
    const service = new FileDownloadService();
    // Objeto circular para testar resiliência do JSON.stringify
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const result = await service.downloadJson("circular.json", circular);
    expect(result).toBe(false);
  });
});
