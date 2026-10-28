import { describe, expect, it, vi } from "vitest";
import { ExpoStoreReviewService } from "@/infra/services/expoStoreReviewService";

describe("ExpoStoreReviewService (Spec 105)", () => {
  it("pede uma vez por abertura quando a loja está disponível", async () => {
    const api = { isAvailableAsync: vi.fn().mockResolvedValue(true), hasAction: vi.fn().mockResolvedValue(true), requestReview: vi.fn().mockResolvedValue(undefined) };
    const service = new ExpoStoreReviewService(api);
    await service.requestReview();
    await service.requestReview();
    expect(api.requestReview).toHaveBeenCalledTimes(1);
  });

  it("sem loja ou com erro, não pede e não quebra", async () => {
    const semLoja = { isAvailableAsync: vi.fn().mockResolvedValue(false), hasAction: vi.fn(), requestReview: vi.fn() };
    await new ExpoStoreReviewService(semLoja).requestReview();
    expect(semLoja.requestReview).not.toHaveBeenCalled();
    const comErro = { isAvailableAsync: vi.fn().mockRejectedValue(new Error("web")), hasAction: vi.fn(), requestReview: vi.fn() };
    await expect(new ExpoStoreReviewService(comErro).requestReview()).resolves.toBeUndefined();
  });

  it("usa o módulo padrão quando nenhum é passado", async () => {
    await expect(new ExpoStoreReviewService().requestReview()).resolves.toBeUndefined();
  });
});
