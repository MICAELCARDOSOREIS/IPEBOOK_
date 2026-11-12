import { describe, expect, it, vi } from "vitest";
import { SupabaseDeliveryDataSource } from "@/infra/datasources/supabaseDeliveryDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DELIVERY_ATTEMPT_MESSAGES } from "@/model/entities/delivery";
import { DataSourceError } from "@/model/errors";

type Result = { data: unknown; error: unknown };

/** Cliente com a leitura de `v2_deliveries` e as duas funções RPC; cada um devolve o resultado combinado. */
function fakeClient({ read, rpc }: { read?: Result; rpc?: Result }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(read ?? { data: null, error: null });
  const rpcFn = vi.fn().mockResolvedValue(rpc ?? { data: null, error: null });
  const client = { from: vi.fn(() => chain), rpc: rpcFn } as unknown as SupabaseAppClient;
  return { client, chain, rpc: rpcFn };
}

describe("SupabaseDeliveryDataSource (Spec 095, ADR 0070)", () => {
  it("lê a entrega concluída e converte as colunas; sem linha, devolve null", async () => {
    const found = fakeClient({ read: { data: { request_id: "r1", completed_by: "leitora", completed_at: "2026-10-29T10:00:00.000Z" }, error: null } });
    expect(await new SupabaseDeliveryDataSource(found.client).findByRequest("r1")).toEqual({
      requestId: "r1", completedBy: "leitora", completedAt: "2026-10-29T10:00:00.000Z",
    });
    expect(found.chain.eq).toHaveBeenCalledWith("request_id", "r1");
    expect(await new SupabaseDeliveryDataSource(fakeClient({}).client).findByRequest("r1")).toBeNull();
  });

  it("falha de leitura vira erro de domínio", async () => {
    const broken = fakeClient({ read: { data: null, error: { message: "x" } } });
    await expect(new SupabaseDeliveryDataSource(broken.client).findByRequest("r1")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("gera o código pela função e converte a validade", async () => {
    const ok = fakeClient({ rpc: { data: [{ code: "K7M2QXWA", expires_at: "2026-10-29T10:15:00.000Z" }], error: null } });
    expect(await new SupabaseDeliveryDataSource(ok.client).createCode("r1", "dono")).toEqual({
      code: "K7M2QXWA", expiresAt: "2026-10-29T10:15:00.000Z",
    });
    expect(ok.rpc).toHaveBeenCalledWith("create_delivery_code", { target_request_id: "r1" });
  });

  it("mostra a mensagem em português das recusas do servidor e esconde os erros técnicos", async () => {
    const raised = fakeClient({ rpc: { data: null, error: { code: "P0001", message: "Confirme o encontro antes de concluir a entrega" } } });
    await expect(new SupabaseDeliveryDataSource(raised.client).createCode("r1", "dono")).rejects.toThrow("Confirme o encontro antes");
    const technical = fakeClient({ rpc: { data: null, error: { code: "42501", message: "permission denied for table" } } });
    await expect(new SupabaseDeliveryDataSource(technical.client).createCode("r1", "dono")).rejects.toThrow("Não foi possível gerar o código da entrega.");
    const empty = fakeClient({ rpc: { data: [], error: null } });
    await expect(new SupabaseDeliveryDataSource(empty.client).createCode("r1", "dono")).rejects.toThrow("Não foi possível gerar o código da entrega.");
  });

  it("confirma a entrega com o código certo", async () => {
    const ok = fakeClient({ rpc: { data: [{ resultado: "ok", concluida_em: "2026-10-29T10:01:00.000Z" }], error: null } });
    expect(await new SupabaseDeliveryDataSource(ok.client).complete("r1", "K7M2QXWA", "leitora")).toEqual({
      requestId: "r1", completedBy: "leitora", completedAt: "2026-10-29T10:01:00.000Z",
    });
    expect(ok.rpc).toHaveBeenCalledWith("complete_delivery", { target_request_id: "r1", informado: "K7M2QXWA" });
  });

  it.each(["incorreto", "expirado", "bloqueado"] as const)("resultado %s vira a mensagem da tentativa", async (resultado) => {
    const client = fakeClient({ rpc: { data: [{ resultado, concluida_em: null }], error: null } });
    await expect(new SupabaseDeliveryDataSource(client.client).complete("r1", "K7M2QXWA", "leitora"))
      .rejects.toThrow(DELIVERY_ATTEMPT_MESSAGES[resultado]);
  });

  it("recusas e falhas da confirmação", async () => {
    const raised = fakeClient({ rpc: { data: null, error: { code: "P0001", message: "Só quem recebe o livro lê o QR da entrega" } } });
    await expect(new SupabaseDeliveryDataSource(raised.client).complete("r1", "K7M2QXWA", "dono")).rejects.toThrow("Só quem recebe");
    const technical = fakeClient({ rpc: { data: null, error: { message: "boom" } } });
    await expect(new SupabaseDeliveryDataSource(technical.client).complete("r1", "K7M2QXWA", "leitora")).rejects.toThrow("Não foi possível confirmar a entrega.");
    const empty = fakeClient({ rpc: { data: [], error: null } });
    await expect(new SupabaseDeliveryDataSource(empty.client).complete("r1", "K7M2QXWA", "leitora")).rejects.toThrow("Não foi possível confirmar a entrega.");
    const okSemData = fakeClient({ rpc: { data: [{ resultado: "ok", concluida_em: null }], error: null } });
    await expect(new SupabaseDeliveryDataSource(okSemData.client).complete("r1", "K7M2QXWA", "leitora")).rejects.toBeInstanceOf(DataSourceError);
  });
});
