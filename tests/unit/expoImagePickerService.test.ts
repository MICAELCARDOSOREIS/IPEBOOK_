import { beforeEach, describe, expect, it, vi } from "vitest";

const picker = vi.hoisted(() => ({
  requestMediaLibraryPermissionsAsync: vi.fn(),
  requestCameraPermissionsAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
  launchCameraAsync: vi.fn(),
}));
const manipulator = vi.hoisted(() => {
  const context = { resize: vi.fn(), renderAsync: vi.fn() };
  return { context, manipulate: vi.fn(() => context) };
});

vi.mock("expo-image-picker", () => picker);
vi.mock("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate: manipulator.manipulate },
  SaveFormat: { JPEG: "jpeg" },
}));
vi.mock("react-native", () => ({ Platform: { OS: "web" } }));

import { ExpoImagePickerService } from "@/infra/services/expoImagePickerService";

const saveAsync = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
  manipulator.context.renderAsync.mockResolvedValue({ saveAsync });
  saveAsync.mockResolvedValue({ uri: "file:///reduzida.jpg", width: 1080, height: 1080 });
  vi.stubGlobal("fetch", vi.fn(async (uri: string) => ({ arrayBuffer: async () => new TextEncoder().encode(uri).buffer })));
});

describe("ExpoImagePickerService (Spec 087)", () => {
  it("reduz fotos grandes para 1080 px antes do envio", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///original.jpg", width: 4000, height: 4000, fileName: "capa.jpg" }],
    });

    const result = await new ExpoImagePickerService().pickSquareImage("library");

    expect(manipulator.manipulate).toHaveBeenCalledWith("file:///original.jpg");
    expect(manipulator.context.resize).toHaveBeenCalledWith({ width: 1080 });
    expect(saveAsync).toHaveBeenCalledWith({ compress: 0.7, format: "jpeg" });
    expect(new TextDecoder().decode(result?.bytes)).toBe("file:///reduzida.jpg");
  });

  it("não amplia fotos que já são pequenas", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///pequena.jpg", width: 800, height: 800 }],
    });

    await new ExpoImagePickerService().pickSquareImage("library");

    expect(manipulator.context.resize).not.toHaveBeenCalled();
    expect(saveAsync).toHaveBeenCalledWith({ compress: 0.7, format: "jpeg" });
  });
});
