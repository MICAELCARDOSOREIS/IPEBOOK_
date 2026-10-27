import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ValidationError } from "@/model/errors";
import type { IImagePickerService, ImageSource, PickedImage } from "@/model/services/iImagePickerService";

const PERMISSION_DENIED: Record<ImageSource, string> = {
  camera: "Permita o acesso à câmera nas configurações do aparelho para tirar a foto.",
  library: "Permita o acesso às fotos nas configurações do aparelho para escolher uma imagem.",
};

/** Seletor de imagens do Expo (ADR 0065): recorte 1:1 e compressão antes do envio. */
export class ExpoImagePickerService implements IImagePickerService {
  async pickSquareImage(source: ImageSource): Promise<PickedImage | null> {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new ValidationError(PERMISSION_DENIED[source]);

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;

    return { bytes: new Uint8Array(await readBytes(asset.uri)), fileName: asset.fileName ?? "foto.jpg" };
  }
}

/** Lê o arquivo escolhido; `expo-file-system` é carregado só no nativo, onde existe. */
async function readBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === "web") return (await fetch(uri)).arrayBuffer();
  const { File } = await import("expo-file-system");
  return new File(uri).arrayBuffer();
}
