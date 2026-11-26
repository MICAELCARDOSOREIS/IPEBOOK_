import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { ImageSource } from "@/model/services/iImagePickerService";

/** Verifica se a permissão de câmera ou galeria já foi concedida no aparelho. */
export async function hasPhotoPermission(source: ImageSource): Promise<boolean> {
  if (Platform.OS === "web") return true;
  try {
    const permission =
      source === "camera"
        ? await ImagePicker.getCameraPermissionsAsync()
        : await ImagePicker.getMediaLibraryPermissionsAsync();
    return Boolean(permission?.granted);
  } catch {
    return false;
  }
}
