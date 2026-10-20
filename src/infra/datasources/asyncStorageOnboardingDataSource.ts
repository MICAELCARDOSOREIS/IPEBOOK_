import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IOnboardingDataSource } from "@/model/datasources/iOnboardingDataSource";

export const WELCOME_SEEN_KEY = "ipebook.boasVindasVistas";

export class AsyncStorageOnboardingDataSource implements IOnboardingDataSource {
  async hasSeenWelcome() {
    return (await AsyncStorage.getItem(WELCOME_SEEN_KEY)) === "1";
  }

  async markWelcomeSeen() {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, "1");
  }
}
