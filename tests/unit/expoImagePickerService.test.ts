
jest.mock("expo-image-picker", () => ({
  __esModule: true,
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));
jest.mock("expo-image-manipulator", () => {
  const context = { resize: jest.fn(), renderAsync: jest.fn() };
  return {
    __esModule: true,
    ImageManipulator: { manipulate: jest.fn(() => context) },
    SaveFormat: { JPEG: "jpeg" },
    __mockContext: context,
  };
});
jest.mock("react-native", () => ({ __esModule: true, Platform: { OS: "web" } }));
jest.mock("expo-file-system", () => ({
  File: class { async arrayBuffer() { return new Uint8Array([1]).buffer; } },
}));

import { Platform } from "react-native";
import { ExpoImagePickerService } from "@/infra/services/expoImagePickerService";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

const picker = jest.requireMock("expo-image-picker") as {
  requestMediaLibraryPermissionsAsync: jest.Mock;
  requestCameraPermissionsAsync: jest.Mock;
  launchImageLibraryAsync: jest.Mock;
  launchCameraAsync: jest.Mock;
};
const manipulatorModule = jest.requireMock("expo-image-manipulator") as {
  ImageManipulator: { manipulate: jest.Mock };
  __mockContext: { resize: jest.Mock; renderAsync: jest.Mock };
};
const manipulator = {
  context: manipulatorModule.__mockContext,
  manipulate: manipulatorModule.ImageManipulator.manipulate,
};

const saveAsync = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = "web";
  picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
  manipulator.context.renderAsync.mockResolvedValue({ saveAsync });
  saveAsync.mockResolvedValue({ uri: "file:///reduzida.jpg", width: 1080, height: 1080 });
  stubGlobal("fetch", jest.fn(async (uri: string) => ({ arrayBuffer: async () => new TextEncoder().encode(uri).buffer })));
});

afterEach(() => {
  unstubAllGlobals();
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

  it("usa a proporção pedida no Android e 1:1 por padrão (Spec 092)", async () => {
    Platform.OS = "android";
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///a.jpg", width: 800, height: 800 }] });
    await new ExpoImagePickerService().pickImage("library", [5, 8]);
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ aspect: [5, 8], allowsEditing: true }));
    await new ExpoImagePickerService().pickSquareImage("library");
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ aspect: [1, 1] }));
  });

  it("no iOS mantém o enquadramento do livro e recorta o avatar em quadrado", async () => {
    Platform.OS = "ios";
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///lombada.jpg", width: 2000, height: 4000 }],
    });
    const service = new ExpoImagePickerService();
    await service.pickImage("library", [1, 6]);
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ allowsEditing: false }));
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(manipulator.manipulate).toHaveBeenLastCalledWith(
      "file:///lombada.jpg",
      { maxWidth: 1080, maxHeight: 1080 },
    );
    expect(manipulator.context.resize).not.toHaveBeenCalled();
    await service.pickSquareImage("library");
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ allowsEditing: true }));
    expect(picker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
