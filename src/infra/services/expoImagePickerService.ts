import { Platform } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ImagePermissionDeniedError } from "@/model/errors";
import type { IImagePickerService, ImageSource, PickedImage } from "@/model/services/iImagePickerService";

const PERMISSION_DENIED: Record<ImageSource, string> = {
  camera: "Permita o acesso à câmera nas configurações do aparelho para tirar a foto.",
  library: "Permita o acesso às fotos nas configurações do aparelho para escolher uma imagem.",
};

/** Lado máximo enviado: suficiente para a tela e reduz armazenamento e tráfego (Spec 087). */
const MAX_SIDE = 1080;

/** Seletor de imagens do Expo com redução e compressão antes do envio. */
export class ExpoImagePickerService implements IImagePickerService {
  pickSquareImage(source: ImageSource): Promise<PickedImage | null> {
    return this.pickImage(source, [1, 1]);
  }

  async pickImage(source: ImageSource, aspect: readonly [number, number]): Promise<PickedImage | null> {
    // O editor nativo do iOS sempre recorta em quadrado. Fotos do livro mantêm o enquadramento original.
    const allowsEditing = Platform.OS !== "ios" || aspect[0] === aspect[1];
    const usesSystemPhotoPicker = Platform.OS === "ios" && source === "library" && !allowsEditing;
    // O seletor web precisa abrir no gesto do usuário. O seletor iOS sem editor só entrega a foto escolhida.
    if (Platform.OS !== "web" && !usesSystemPhotoPicker) {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new ImagePermissionDeniedError(PERMISSION_DENIED[source]);
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing,
      aspect: [aspect[0], aspect[1]],
      // A compressão acontece uma só vez, depois de reduzir
      quality: 1,
    };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;

    // No iPhone, reduzir na decodificação evita carregar fotos de alta resolução por inteiro na memória.
    const ios = Platform.OS === "ios";
    const context = ios
      ? ImageManipulator.manipulate(asset.uri, { maxWidth: MAX_SIDE, maxHeight: MAX_SIDE })
      : ImageManipulator.manipulate(asset.uri);
    if (!ios && Math.max(asset.width, asset.height) > MAX_SIDE) {
      context.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
    }
    const reduced = await (await context.renderAsync()).saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

    return { bytes: new Uint8Array(await readBytes(reduced.uri)), fileName: asset.fileName ?? "foto.jpg" };
  }
}

/**
 * Lê o arquivo escolhido. No navegador `fetch` lê o `blob:`; no nativo `fetch` de `file://` devolvia bytes
 * que não eram a imagem ("Use uma foto em JPEG…"), então lê pelo `expo-file-system`. O `require` fica
 * dentro da função (síncrono): o `import()` dinâmico gerava um pacote assíncrono que o Expo Go não achava
 * ("Requiring unknown module") e o módulo só existe no nativo.
 */
async function readBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") return (await fetch(uri)).arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { File } = require("expo-file-system") as typeof import("expo-file-system");
  return new File(uri).arrayBuffer();
}
