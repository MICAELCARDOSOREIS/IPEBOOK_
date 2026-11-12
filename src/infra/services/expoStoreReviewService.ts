import * as StoreReview from "expo-store-review";
import type { IStoreReviewService } from "@/model/services/iStoreReviewService";

type StoreReviewApi = Pick<typeof StoreReview, "isAvailableAsync" | "hasAction" | "requestReview">;

/** Avaliação nativa da Play Store/App Store (Spec 105); pede no máximo uma vez por abertura do app. */
export class ExpoStoreReviewService implements IStoreReviewService {
  private asked = false;

  constructor(private readonly api: StoreReviewApi = StoreReview) {}

  async requestReview(): Promise<void> {
    if (this.asked) return;
    this.asked = true;
    try {
      if ((await this.api.isAvailableAsync()) && (await this.api.hasAction())) {
        await this.api.requestReview();
      }
    } catch {
      // Sem loja (web, emulador): segue sem pedir.
    }
  }
}
