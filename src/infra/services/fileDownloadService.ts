import { Platform } from "react-native";
import type { IFileDownloadService } from "@/model/services/iFileDownloadService";

export class FileDownloadService implements IFileDownloadService {
  async downloadJson(filename: string, data: unknown): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      if (Platform.OS === "web" && typeof document !== "undefined") {
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        return true;
      }
      if (Platform.OS !== "ios" && Platform.OS !== "android") return false;

      const FileSystem = await import("expo-file-system/legacy");
      const Sharing = await import("expo-sharing");
      if (!FileSystem.documentDirectory || !(await Sharing.isAvailableAsync())) return false;

      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileUri = `${FileSystem.documentDirectory}${safeName}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      await Sharing.shareAsync(fileUri, { mimeType: "application/json", UTI: "public.json" });
      return true;
    } catch {
      return false;
    }
  }
}
