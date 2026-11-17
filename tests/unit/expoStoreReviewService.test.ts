import { ExpoStoreReviewService } from "@/infra/services/expoStoreReviewService";

describe("ExpoStoreReviewService (Spec 105)", () => {
  it("pede uma vez por abertura quando a loja está disponível", async () => {
    const api = { isAvailableAsync: jest.fn().mockResolvedValue(true), hasAction: jest.fn().mockResolvedValue(true), requestReview: jest.fn().mockResolvedValue(undefined) };
    const service = new ExpoStoreReviewService(api);
    await service.requestReview();
    await service.requestReview();
    expect(api.requestReview).toHaveBeenCalledTimes(1);
  });

  it("sem loja ou com erro, não pede e não quebra", async () => {
    const semLoja = { isAvailableAsync: jest.fn().mockResolvedValue(false), hasAction: jest.fn(), requestReview: jest.fn() };
    await new ExpoStoreReviewService(semLoja).requestReview();
    expect(semLoja.requestReview).not.toHaveBeenCalled();
    const comErro = { isAvailableAsync: jest.fn().mockRejectedValue(new Error("web")), hasAction: jest.fn(), requestReview: jest.fn() };
    await expect(new ExpoStoreReviewService(comErro).requestReview()).resolves.toBeUndefined();
  });

  it("usa o módulo padrão quando nenhum é passado", async () => {
    await expect(new ExpoStoreReviewService().requestReview()).resolves.toBeUndefined();
  });
});
