import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IAppUpdateDismissDataSource } from "@/model/datasources/iAppUpdateDismissDataSource";

export const APP_UPDATE_DISMISSED_KEY = "ipebook.atualizacaoDispensada";

export class AsyncStorageAppUpdateDismissDataSource implements IAppUpdateDismissDataSource {
  async getDismissedVersion() {
    return AsyncStorage.getItem(APP_UPDATE_DISMISSED_KEY);
  }
  async dismissVersion(version: string) {
    await AsyncStorage.setItem(APP_UPDATE_DISMISSED_KEY, version);
  }
}
