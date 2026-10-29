import { describe, expect, it, vi } from "vitest";
import { SupabaseMeetingDataSource } from "@/infra/datasources/supabaseMeetingDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DataSourceError } from "@/model/errors";

const row = {
  id: "m1",
  request_id: "r1",
  point_name: "Praça da Bandeira (Centro)",
  scheduled_at: "2026-10-23T13:00:00.000Z",
  proposed_by: "dono",
  status: "proposed",
};

/** Cadeia do PostgREST: cada método devolve a própria cadeia; os terminais resolvem `result`. */
function fakeClient(result: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "eq", "order", "limit", "insert", "update"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  chain.single = vi.fn().mockResolvedValue(result);
  const client = { from: vi.fn(() => chain) } as unknown as SupabaseAppClient;
  return { client, chain };
}

describe("SupabaseMeetingDataSource (Spec 052)", () => {
  it("lê o último encontro do pedido e converte as colunas", async () => {
    const { client, chain } = fakeClient({ data: row, error: null });
    const meeting = await new SupabaseMeetingDataSource(client).findLatestByRequest("r1");
    expect(meeting).toEqual({
      id: "m1", requestId: "r1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2026-10-23T13:00:00.000Z", proposedBy: "dono", status: "proposed",
    });
    expect(chain.eq).toHaveBeenCalledWith("request_id", "r1");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("devolve null sem encontro e erro de domínio em falha de leitura", async () => {
    expect(await new SupabaseMeetingDataSource(fakeClient({ data: null, error: null }).client).findById("x")).toBeNull();
    await expect(new SupabaseMeetingDataSource(fakeClient({ data: null, error: { message: "x" } }).client).findLatestByRequest("r1"))
      .rejects.toBeInstanceOf(DataSourceError);
    await expect(new SupabaseMeetingDataSource(fakeClient({ data: null, error: { message: "x" } }).client).findById("m1"))
      .rejects.toBeInstanceOf(DataSourceError);
  });

  it("cria o convite e traduz a violação de encontro ativo único", async () => {
    const ok = fakeClient({ data: row, error: null });
    const created = await new SupabaseMeetingDataSource(ok.client).create({
      requestId: "r1", pointName: row.point_name, scheduledAt: row.scheduled_at, proposedBy: "dono",
    });
    expect(created.id).toBe("m1");
    expect(ok.chain.insert).toHaveBeenCalledWith({
      request_id: "r1", point_name: row.point_name, scheduled_at: row.scheduled_at, proposed_by: "dono",
    });
    const duplicate = fakeClient({ data: null, error: { code: "23505" } });
    await expect(new SupabaseMeetingDataSource(duplicate.client).create({
      requestId: "r1", pointName: row.point_name, scheduledAt: row.scheduled_at, proposedBy: "dono",
    })).rejects.toThrow(/Já existe/);
    const failure = fakeClient({ data: null, error: { code: "42501" } });
    await expect(new SupabaseMeetingDataSource(failure.client).create({
      requestId: "r1", pointName: row.point_name, scheduledAt: row.scheduled_at, proposedBy: "dono",
    })).rejects.toThrow(/convite/);
  });

  it("atualiza só a partir da situação esperada", async () => {
    const ok = fakeClient({ data: { ...row, status: "confirmed" }, error: null });
    const confirmed = await new SupabaseMeetingDataSource(ok.client).update("m1", { status: "confirmed" }, "proposed", "leitora");
    expect(confirmed.status).toBe("confirmed");
    expect(ok.chain.update).toHaveBeenCalledWith({ status: "confirmed" });
    expect(ok.chain.eq).toHaveBeenCalledWith("status", "proposed");

    const reschedule = fakeClient({ data: row, error: null });
    await new SupabaseMeetingDataSource(reschedule.client).update(
      "m1", { status: "proposed", proposedBy: "leitora", pointName: "Praça de Eventos", scheduledAt: row.scheduled_at }, "confirmed", "leitora",
    );
    expect(reschedule.chain.update).toHaveBeenCalledWith({
      status: "proposed", proposed_by: "leitora", point_name: "Praça de Eventos", scheduled_at: row.scheduled_at,
    });

    await expect(new SupabaseMeetingDataSource(fakeClient({ data: null, error: null }).client).update("m1", { status: "cancelled" }, "proposed", "dono"))
      .rejects.toThrow(/mudou/);
    await expect(new SupabaseMeetingDataSource(fakeClient({ data: null, error: { message: "x" } }).client).update("m1", { status: "cancelled" }, "proposed", "dono"))
      .rejects.toThrow(/atualizar/);
  });
});
