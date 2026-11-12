import { describe, expect, it } from "vitest";
import { MemoryModerationDataSource } from "@/infra/datasources/memoryModerationDataSource";
import type { ModerationItem } from "@/model/entities/moderation";
import { AuthError, ValidationError } from "@/model/errors";
import { ModerationUseCases } from "@/usecase/moderationUseCases";

const listing: ModerationItem = {
  kind: "listing",
  targetId: "b1",
  label: "Dom Casmurro",
  ownerId: "ana",
  reasons: ["fraud_or_scam"],
  details: [],
  reportCount: 3,
  firstReportedAt: "2026-10-28T10:00:00Z",
};
const person: ModerationItem = { ...listing, kind: "user", targetId: "ana", label: "Ana", reportCount: 1 };

describe("ModerationUseCases (Spec 102)", () => {
  it("sem sessão não é moderador e não vê a fila", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([listing], true));
    await expect(useCases.isModerator(null)).resolves.toBe(false);
    await expect(useCases.listQueue(null)).rejects.toBeInstanceOf(AuthError);
  });

  it("quem não é moderador não vê a fila nem decide", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([listing], false));
    await expect(useCases.isModerator("bia")).resolves.toBe(false);
    await expect(useCases.listQueue("bia")).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.decide(listing, "dismiss", "bia")).rejects.toBeInstanceOf(AuthError);
  });

  it("moderador vê a fila e cada decisão tira o alvo dela", async () => {
    const source = new MemoryModerationDataSource([listing, person], true);
    const useCases = new ModerationUseCases(source);
    await expect(useCases.listQueue("mod")).resolves.toHaveLength(2);
    await useCases.decide(listing, "remove_listing", "mod");
    await useCases.decide(person, "suspend_user", "mod", "Golpe");
    await expect(useCases.listQueue("mod")).resolves.toHaveLength(0);
    expect(source.decisions).toEqual([
      { kind: "listing", targetId: "b1", decision: "remove_listing", note: undefined },
      { kind: "user", targetId: "ana", decision: "suspend_user", note: "Golpe" },
    ]);
  });

  it("não remove anúncio a partir de denúncia de pessoa", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([person], true));
    await expect(useCases.decide(person, "remove_listing", "mod")).rejects.toBeInstanceOf(ValidationError);
  });

  it("falha ao checar moderador conta como não moderador", async () => {
    const source = new MemoryModerationDataSource([], true);
    source.isModerator = async () => {
      throw new Error("rede");
    };
    await expect(new ModerationUseCases(source).isModerator("mod")).resolves.toBe(false);
  });
});
