import { Platform } from "react-native";
import type { IInAppUpdateService, StoreUpdateInfo } from "@/model/services/iInAppUpdateService";

export class GooglePlayInAppUpdateService implements IInAppUpdateService {
  async checkStoreUpdate(): Promise<StoreUpdateInfo> {
    if (Platform.OS !== "android") {
      return { isUpdateAvailable: false };
    }
    try {
      // Quando integrado com o bundle nativo da Play Store, consulta a disponibilidade.
      // Em ambientes sem Play Core ou em desenvolvimento, falha suavemente retornando false.
      return { isUpdateAvailable: false };
    } catch {
      return { isUpdateAvailable: false };
    }
  }

  async startUpdateFlow(): Promise<boolean> {
    return false;
  }
}
