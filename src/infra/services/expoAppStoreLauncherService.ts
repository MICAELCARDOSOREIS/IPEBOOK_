import * as Linking from "expo-linking";
import { Platform } from "react-native";
import type { IAppStoreLauncherService } from "@/model/services/iAppStoreLauncherService";

export const DEFAULT_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR";

export class ExpoAppStoreLauncherService implements IAppStoreLauncherService {
  async openStore(storeUrl: string) {
    if (Platform.OS !== "android") {
      await Linking.openURL(storeUrl || DEFAULT_PLAY_STORE_URL);
      return;
    }
    try {
      await Linking.openURL("market://details?id=com.ipebook.app");
    } catch {
      await Linking.openURL(storeUrl || DEFAULT_PLAY_STORE_URL);
    }
  }
}
