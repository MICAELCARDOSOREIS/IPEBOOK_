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
      return true;
    } catch {
      return false;
    }
  }
}
