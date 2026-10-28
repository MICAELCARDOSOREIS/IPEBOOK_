import { describe, expect, it, vi } from "vitest";
import { SupabaseModerationDataSource } from "@/infra/datasources/supabaseModerationDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DataSourceError } from "@/model/errors";

function clientWith(result: { data: unknown; error: unknown }) {
  const rpc = vi.fn().mockResolvedValue(result);
  return { client: { rpc } as unknown as SupabaseAppClient, rpc };
}

describe("SupabaseModerationDataSource (Spec 102)", () => {
  it("converte a fila do servidor", async () => {
    const { client, rpc } = clientWith({
      data: [{ kind: "listing", target_id: "b1", target_label: "Dom Casmurro", owner_id: "ana", reasons: ["other"], details: null, report_count: "3", first_reported_at: "2026-10-28T10:00:00Z" }],
      error: null,
    });
    const items = await new SupabaseModerationDataSource(client).listQueue();
    expect(rpc).toHaveBeenCalledWith("v2_moderation_queue");
    expect(items).toEqual([{ kind: "listing", targetId: "b1", label: "Dom Casmurro", ownerId: "ana", reasons: ["other"], details: [], reportCount: 3, firstReportedAt: "2026-10-28T10:00:00Z" }]);
  });

  it("falha da fila vira erro de dados; falha ao checar moderador vira falso", async () => {
    const { client } = clientWith({ data: null, error: { message: "Acesso restrito" } });
    const source = new SupabaseModerationDataSource(client);
    await expect(source.listQueue()).rejects.toBeInstanceOf(DataSourceError);
    await expect(source.isModerator()).resolves.toBe(false);
  });

  it("envia a decisão com a nota", async () => {
    const { client, rpc } = clientWith({ data: "suspended", error: null });
    await new SupabaseModerationDataSource(client).resolve("user", "ana", "suspend_user", "Golpe");
    expect(rpc).toHaveBeenCalledWith("v2_moderation_resolve", { target_kind: "user", target: "ana", decision: "suspend_user", note: "Golpe" });
  });
});
