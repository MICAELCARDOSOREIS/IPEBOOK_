import { describe, expect, it } from "vitest";
import { RatingUseCases } from "@/usecase/ratingUseCases";
import { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { AuthError } from "@/model/errors";

describe("Caso de uso: listReceivedRatings (ISO/IEC 25010 - Adequação e Segurança)", () => {
  it("exige sessão autenticada", async () => {
    const uc = new RatingUseCases(new MemoryRatingDataSource(), new MemoryProfileDataSource());
    await expect(uc.listReceivedRatings(null)).rejects.toThrow(AuthError);
  });

  it("lista as avaliações recebidas com o nome de quem avaliou, mais recentes primeiro", async () => {
    const ratings = new MemoryRatingDataSource([
      { id: "r1", raterId: "ana", ratedUserId: "bia", requestId: "req-1", score: 5, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "r2", raterId: "carlos", ratedUserId: "bia", requestId: "req-2", score: 4, createdAt: "2026-02-01T00:00:00.000Z" },
      { id: "r3", raterId: "ana", ratedUserId: "outra-pessoa", requestId: "req-3", score: 3, createdAt: "2026-03-01T00:00:00.000Z" },
    ]);
    const profiles = new MemoryProfileDataSource();
    await profiles.ensure("ana", "Ana Paula");
    await profiles.ensure("carlos", "Carlos");

    const uc = new RatingUseCases(ratings, profiles);
    const result = await uc.listReceivedRatings("bia");

    expect(result).toHaveLength(2);
    expect(result[0].raterName).toBe("Carlos");
    expect(result[0].score).toBe(4);
    expect(result[1].raterName).toBe("Ana Paula");
  });

  it("retorna nome nulo quando o perfil de quem avaliou não existe", async () => {
    const ratings = new MemoryRatingDataSource([
      { id: "r1", raterId: "fantasma", ratedUserId: "bia", requestId: "req-1", score: 5, createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
    const uc = new RatingUseCases(ratings, new MemoryProfileDataSource());
    const result = await uc.listReceivedRatings("bia");
    expect(result[0].raterName).toBeNull();
  });
});
