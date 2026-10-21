import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { FileDownloadService } from "@/infra/services/fileDownloadService";

const native = vi.hoisted(() => ({
  write: vi.fn(),
  available: vi.fn(),
  share: vi.fn(),
}));
vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///dados/",
  writeAsStringAsync: native.write,
}));
vi.mock("expo-sharing", () => ({
  isAvailableAsync: native.available,
  shareAsync: native.share,
}));

describe("FileDownloadService (Spec 029 - LGPD Portabilidade)", () => {
  const originalPlatform = Platform.OS;
  beforeEach(() => {
    Platform.OS = "android";
    native.write.mockReset().mockResolvedValue(undefined);
    native.available.mockReset().mockResolvedValue(true);
    native.share.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    Platform.OS = originalPlatform;
    vi.unstubAllGlobals();
  });

  it("grava o JSON e abre o compartilhamento no aplicativo nativo", async () => {
    const service = new FileDownloadService();
    const result = await service.downloadJson("dados-teste.json", {
      usuario: "teste",
      dados: [1, 2, 3],
    });
    expect(result).toBe(true);
    expect(native.write).toHaveBeenCalledWith("file:///dados/dados-teste.json", expect.stringContaining('"usuario": "teste"'));
    expect(native.share).toHaveBeenCalledWith("file:///dados/dados-teste.json", expect.objectContaining({ mimeType: "application/json" }));
  });

  it("não anuncia sucesso quando o compartilhamento está indisponível ou falha", async () => {
    const service = new FileDownloadService();
    native.available.mockResolvedValueOnce(false);
    expect(await service.downloadJson("dados.json", {})).toBe(false);
    expect(native.write).not.toHaveBeenCalled();

    native.share.mockRejectedValueOnce(new Error("falha nativa"));
    expect(await service.downloadJson("dados.json", {})).toBe(false);
  });

  it("cria um download JSON no navegador", async () => {
    Platform.OS = "web";
    const click = vi.fn();
    const anchor = { href: "", download: "", click };
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: () => anchor, body: { appendChild, removeChild } });
    vi.stubGlobal("URL", { createObjectURL: () => "blob:ipebook", revokeObjectURL });
    expect(await new FileDownloadService().downloadJson("dados.json", { titulo: "Livro" })).toBe(true);
    expect(anchor.download).toBe("dados.json");
    expect(click).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:ipebook");
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
