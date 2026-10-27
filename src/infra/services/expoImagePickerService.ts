import { Platform } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ValidationError } from "@/model/errors";
import type { IImagePickerService, ImageSource, PickedImage } from "@/model/services/iImagePickerService";

const PERMISSION_DENIED: Record<ImageSource, string> = {
  camera: "Permita o acesso à câmera nas configurações do aparelho para tirar a foto.",
  library: "Permita o acesso às fotos nas configurações do aparelho para escolher uma imagem.",
};

/** Lado máximo enviado: suficiente para a tela e reduz armazenamento e tráfego (Spec 087). */
const MAX_SIDE = 1080;

/** Seletor de imagens do Expo (ADR 0065): recorte 1:1, redução para 1080 px e compressão antes do envio. */
export class ExpoImagePickerService implements IImagePickerService {
  pickSquareImage(source: ImageSource): Promise<PickedImage | null> {
    return this.pickImage(source, [1, 1]);
  }

  async pickImage(source: ImageSource, aspect: readonly [number, number]): Promise<PickedImage | null> {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new ValidationError(PERMISSION_DENIED[source]);

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [aspect[0], aspect[1]],
      // A compressão acontece uma só vez, depois de reduzir
      quality: 1,
    };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;

    const context = ImageManipulator.manipulate(asset.uri);
    if (asset.width > MAX_SIDE) context.resize({ width: MAX_SIDE });
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
