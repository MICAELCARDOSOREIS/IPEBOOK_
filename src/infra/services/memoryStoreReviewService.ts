import type { IStoreReviewService } from "@/model/services/iStoreReviewService";

/** Conta os pedidos de avaliação; usado em testes. */
export class MemoryStoreReviewService implements IStoreReviewService {
  requests = 0;

  async requestReview(): Promise<void> {
    this.requests += 1;
  }
}
