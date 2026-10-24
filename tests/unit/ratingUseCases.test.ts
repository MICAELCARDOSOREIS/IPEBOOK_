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

describe("Caso de uso: submitRating e getNegotiationRating (Spec 063 / ADR 0046)", () => {
  it("exige sessão autenticada para avaliar", async () => {
    const uc = new RatingUseCases(new MemoryRatingDataSource(), new MemoryProfileDataSource());
    await expect(
      uc.submitRating(null, { requestId: "req-1", ratedUserId: "user-2", score: 5 }),
    ).rejects.toThrow(AuthError);
  });

  it("rejeita nota inválida (menor que 1, maior que 5 ou fracionária)", async () => {
    const uc = new RatingUseCases(new MemoryRatingDataSource(), new MemoryProfileDataSource());
    await expect(
      uc.submitRating("user-1", { requestId: "req-1", ratedUserId: "user-2", score: 0 }),
    ).rejects.toThrow("A nota deve ser um número inteiro de 1 a 5 estrelas.");
    await expect(
      uc.submitRating("user-1", { requestId: "req-1", ratedUserId: "user-2", score: 6 }),
    ).rejects.toThrow("A nota deve ser um número inteiro de 1 a 5 estrelas.");
    await expect(
      uc.submitRating("user-1", { requestId: "req-1", ratedUserId: "user-2", score: 4.5 }),
    ).rejects.toThrow("A nota deve ser um número inteiro de 1 a 5 estrelas.");
  });

  it("rejeita autoavaliação", async () => {
    const uc = new RatingUseCases(new MemoryRatingDataSource(), new MemoryProfileDataSource());
    await expect(
      uc.submitRating("user-1", { requestId: "req-1", ratedUserId: "user-1", score: 5 }),
    ).rejects.toThrow("Você não pode avaliar a si mesmo.");
  });

  it("rejeita campos vazios", async () => {
    const uc = new RatingUseCases(new MemoryRatingDataSource(), new MemoryProfileDataSource());
    await expect(
      uc.submitRating("user-1", { requestId: "", ratedUserId: "user-2", score: 5 }),
    ).rejects.toThrow("Identificador da negociação é obrigatório.");
  });

  it("salva avaliação com sucesso e recupera com getNegotiationRating", async () => {
    const ratings = new MemoryRatingDataSource();
    const uc = new RatingUseCases(ratings, new MemoryProfileDataSource());

    const created = await uc.submitRating("user-1", {
      requestId: "req-123",
      ratedUserId: "user-2",
      score: 5,
    });

    expect(created.id).toBeDefined();
    expect(created.raterId).toBe("user-1");
    expect(created.ratedUserId).toBe("user-2");
    expect(created.score).toBe(5);

    const retrieved = await uc.getNegotiationRating("user-1", "req-123");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.score).toBe(5);

    // Outro usuário que não avaliou recebe null
    const other = await uc.getNegotiationRating("user-2", "req-123");
    expect(other).toBeNull();
  });

  it("impede envio duplicado de avaliação para o mesmo pedido", async () => {
    const ratings = new MemoryRatingDataSource();
    const uc = new RatingUseCases(ratings, new MemoryProfileDataSource());

    await uc.submitRating("user-1", {
      requestId: "req-123",
      ratedUserId: "user-2",
      score: 4,
    });

    await expect(
      uc.submitRating("user-1", {
        requestId: "req-123",
        ratedUserId: "user-2",
        score: 5,
      }),
    ).rejects.toThrow("Você já avaliou esta negociação.");
  });
});
