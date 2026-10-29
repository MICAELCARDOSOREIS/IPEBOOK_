import { beforeEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
import type { Book } from "@/model/entities/book";
import { ValidationError } from "@/model/errors";
import { PublicProfileUseCases } from "@/usecase/publicProfileUseCases";

const listing: Book = {
  id: "listing-1",
  title: "Quarto de Despejo",
  author: "Carolina Maria de Jesus",
  ownerId: "ana",
  modality: "donation",
  status: "available",
};

describe("perfil público do anunciante (spec 018)", () => {
  let books: MemoryBookDataSource;
  let requests: MemoryBookRequestDataSource;
  let profiles: MemoryProfileDataSource;
  let ratings: MemoryRatingDataSource;
  let useCases: PublicProfileUseCases;

  beforeEach(() => {
    books = new MemoryBookDataSource([listing]);
    requests = new MemoryBookRequestDataSource();
    profiles = new MemoryProfileDataSource();
    ratings = new MemoryRatingDataSource();
    useCases = new PublicProfileUseCases(profiles, ratings, books, requests);
  });

  it("exige um userId", async () => {
    await expect(useCases.getPublicProfile("")).rejects.toBeInstanceOf(ValidationError);
  });

  it("cria perfil com nome padrão e sem avaliações na primeira consulta", async () => {
    const profile = await useCases.getPublicProfile("ana");
    expect(profile.userId).toBe("ana");
    expect(profile.name).toBeTruthy();
    expect(profile.joinedAt).toBeTruthy();
    expect(profile.averageRating).toBeNull();
    expect(profile.ratingCount).toBe(0);
    expect(profile.completedNegotiations).toBe(0);
  });

  it("mantém o mesmo nome e data de entrada em consultas seguintes", async () => {
    const first = await useCases.getPublicProfile("ana");
    const second = await useCases.getPublicProfile("ana");
    expect(second.name).toBe(first.name);
    expect(second.joinedAt).toBe(first.joinedAt);
  });

  it("agrega a média e a contagem de avaliações recebidas", async () => {
    await ratings.create({ raterId: "bob", ratedUserId: "ana", requestId: "r1", score: 4 });
    await ratings.create({ raterId: "carol", ratedUserId: "ana", requestId: "r2", score: 5 });
    const profile = await useCases.getPublicProfile("ana");
    expect(profile.averageRating).toBeCloseTo(4.5);
    expect(profile.ratingCount).toBe(2);
  });

  it("conta negociações concluídas (aceitas) como dono e como solicitante", async () => {
    const asOwner = await requests.create({ listingId: "listing-1", requesterId: "bob", status: "pending" });
    await requests.respond(asOwner.id, "accepted");

    const { id: _unusedId, ...listingWithoutId } = listing;
    const { id: otherListingId } = await books.create({ ...listingWithoutId, ownerId: "carol" });
    const asRequester = await requests.create({ listingId: otherListingId, requesterId: "ana", status: "pending" });
    await requests.respond(asRequester.id, "accepted");

    await requests.create({ listingId: "listing-1", requesterId: "dave", status: "pending" });

    const profile = await useCases.getPublicProfile("ana");
    expect(profile.completedNegotiations).toBe(2);
  });

  describe("edição do perfil próprio (spec 006 / issue #55)", () => {
    it("exige um userId", async () => {
      await expect(useCases.updateProfile("", { name: "Ana" })).rejects.toBeInstanceOf(ValidationError);
    });

    it("exige um nome não vazio", async () => {
      await expect(useCases.updateProfile("ana", { name: "   " })).rejects.toBeInstanceOf(ValidationError);
    });

    it("rejeita nome maior que o limite", async () => {
      await expect(useCases.updateProfile("ana", { name: "a".repeat(61) })).rejects.toBeInstanceOf(ValidationError);
    });

    it("rejeita link de foto que não é http(s)", async () => {
      await expect(
        useCases.updateProfile("ana", { name: "Ana", photoUrl: "ftp://exemplo.com/foto.png" }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it("atualiza nome, foto e rede social, e persiste em consultas seguintes", async () => {
      const updated = await useCases.updateProfile("ana", {
        name: "Ana Paula",
        photoUrl: "https://exemplo.com/foto.png",
        socialHandle: "@anapaula",
      });
      expect(updated.name).toBe("Ana Paula");
      expect(updated.photoUrl).toBe("https://exemplo.com/foto.png");
      expect(updated.socialHandle).toBe("@anapaula");

      const reloaded = await useCases.getPublicProfile("ana");
      expect(reloaded.name).toBe("Ana Paula");
      expect(reloaded.photoUrl).toBe("https://exemplo.com/foto.png");
    });

    it("permite limpar foto e rede social com valores vazios", async () => {
      await useCases.updateProfile("ana", { name: "Ana", photoUrl: "https://exemplo.com/foto.png", socialHandle: "@ana" });
      const cleared = await useCases.updateProfile("ana", { name: "Ana", photoUrl: "", socialHandle: "" });
      expect(cleared.photoUrl).toBeUndefined();
      expect(cleared.socialHandle).toBeUndefined();
    });

    it("cria o perfil antes de atualizar quando ainda não existe", async () => {
      const updated = await useCases.updateProfile("nova-usuaria", { name: "Nova" });
      expect(updated.userId).toBe("nova-usuaria");
      expect(updated.name).toBe("Nova");
    });
  });
});
