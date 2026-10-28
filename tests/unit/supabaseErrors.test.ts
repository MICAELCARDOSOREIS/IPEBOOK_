import { describe, expect, it, vi } from "vitest";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { toDomainError } from "@/infra/supabaseErrors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DataSourceError, ValidationError } from "@/model/errors";

describe("toDomainError (Spec 103)", () => {
  it("limite contra abuso vira ValidationError com a mensagem do banco", () => {
    const error = toDomainError({ code: "IBLIM", message: "Limite de 10 pedidos por dia atingido." }, "genérica");
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Limite de 10 pedidos por dia atingido.");
  });

  it("outros erros viram DataSourceError com a mensagem genérica", () => {
    for (const raw of [{ code: "42501", message: "RLS" }, null, { code: "IBLIM" }]) {
      const error = toDomainError(raw, "genérica");
      expect(error).toBeInstanceOf(DataSourceError);
      expect(error.message).toBe("genérica");
    }
  });

  it("o pedido mostra o limite para a pessoa", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { code: "IBLIM", message: "Limite de 10 pedidos por dia atingido." } });
    const chain = { insert: vi.fn(() => chain), select: vi.fn(() => chain), single };
    const client = { from: vi.fn(() => chain) } as unknown as SupabaseAppClient;
    await expect(
      new SupabaseBookRequestDataSource(client).create({ listingId: "b1", requesterId: "ana", status: "pending" }),
    ).rejects.toThrow("Limite de 10 pedidos por dia atingido.");
  });
});
