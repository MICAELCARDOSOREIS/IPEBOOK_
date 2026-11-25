import { Platform } from "react-native";
import { FileDownloadService } from "@/infra/services/fileDownloadService";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

jest.mock("expo-file-system/legacy", () => ({
  __esModule: true,
  cacheDirectory: "file:///cache/",
  documentDirectory: "file:///dados/",
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));
jest.mock("expo-sharing", () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const native = {
  write: (jest.requireMock("expo-file-system/legacy") as { writeAsStringAsync: jest.Mock }).writeAsStringAsync,
  remove: (jest.requireMock("expo-file-system/legacy") as { deleteAsync: jest.Mock }).deleteAsync,
  available: (jest.requireMock("expo-sharing") as { isAvailableAsync: jest.Mock }).isAvailableAsync,
  share: (jest.requireMock("expo-sharing") as { shareAsync: jest.Mock }).shareAsync,
};

describe("FileDownloadService (Spec 029 / Spec 143 - LGPD Portabilidade)", () => {
  const originalPlatform = Platform.OS;
  beforeEach(() => {
    Platform.OS = "android";
    native.write.mockReset().mockResolvedValue(undefined);
    native.remove.mockReset().mockResolvedValue(undefined);
    native.available.mockReset().mockResolvedValue(true);
    native.share.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    Platform.OS = originalPlatform;
    unstubAllGlobals();
  });

  it("grava o JSON em cacheDirectory, compartilha e remove o arquivo temporário em finally", async () => {
    const service = new FileDownloadService();
    const result = await service.downloadJson("dados-teste.json", {
      usuario: "teste",
      dados: [1, 2, 3],
    });
    expect(result).toBe(true);
    expect(native.write).toHaveBeenCalledWith("file:///cache/dados-teste.json", expect.stringContaining('"usuario": "teste"'));
    expect(native.share).toHaveBeenCalledWith("file:///cache/dados-teste.json", expect.objectContaining({ mimeType: "application/json" }));
    expect(native.remove).toHaveBeenCalledWith("file:///cache/dados-teste.json", { idempotent: true });
  });

  it("não anuncia sucesso quando o compartilhamento está indisponível ou falha e limpa o arquivo temporário", async () => {
    const service = new FileDownloadService();
    native.available.mockResolvedValueOnce(false);
    expect(await service.downloadJson("dados.json", {})).toBe(false);
    expect(native.write).not.toHaveBeenCalled();
    expect(native.remove).not.toHaveBeenCalled();

    native.share.mockRejectedValueOnce(new Error("falha nativa"));
    expect(await service.downloadJson("dados.json", {})).toBe(false);
    expect(native.remove).toHaveBeenCalledWith("file:///cache/dados.json", { idempotent: true });
  });

  it("cria um download JSON no navegador", async () => {
    Platform.OS = "web";
    const click = jest.fn();
    const anchor = { href: "", download: "", click };
    const appendChild = jest.fn();
    const removeChild = jest.fn();
    const revokeObjectURL = jest.fn();
    stubGlobal("document", { createElement: () => anchor, body: { appendChild, removeChild } });
    stubGlobal("URL", { createObjectURL: () => "blob:ipebook", revokeObjectURL });
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
