
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

  it("usa a proporção pedida no recorte da capa (5:8) e 1:1 por padrão (Spec 092)", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///a.jpg", width: 800, height: 800 }] });
    await new ExpoImagePickerService().pickImage("library", [5, 8]);
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ aspect: [5, 8], allowsEditing: true }));
    await new ExpoImagePickerService().pickSquareImage("library");
    expect(picker.launchImageLibraryAsync).toHaveBeenLastCalledWith(expect.objectContaining({ aspect: [1, 1] }));
  });
});
