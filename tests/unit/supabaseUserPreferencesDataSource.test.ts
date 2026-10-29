import { describe, expect, it, vi } from "vitest";
import { SupabaseUserPreferencesDataSource } from "@/infra/datasources/supabaseUserPreferencesDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(...tableImpls: unknown[]): SupabaseAppClient {
  const queue = [...tableImpls];
  return { from: vi.fn().mockImplementation(() => queue.shift()) } as unknown as SupabaseAppClient;
}

describe("SupabaseUserPreferencesDataSource (Spec 034 / Issue #141)", () => {
  it("findById retorna as preferências mapeadas", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { user_id: "ana", phone: "86999998888", neighborhood: "Centro" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toEqual({ userId: "ana", phone: "86999998888", neighborhood: "Centro" });
  });

  it("findById retorna null quando não encontrado", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toBeNull();
  });

  it("findById lança DataSourceError em erro de banco", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "falhou" } });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    await expect(ds.findById("ana")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("upsert salva e retorna as preferências atualizadas", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { user_id: "ana", phone: "86999998888", neighborhood: "Centro" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    const result = await ds.upsert("ana", { phone: "86999998888", neighborhood: "Centro" });
    expect(result).toEqual({ userId: "ana", phone: "86999998888", neighborhood: "Centro" });
    expect(upsert).toHaveBeenCalledWith(
      { user_id: "ana", phone: "86999998888", neighborhood: "Centro" },
      { onConflict: "user_id" },
    );
  });

  it("upsert lança DataSourceError quando o banco retorna erro", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { message: "falhou" } });
    const client = fakeClient({ upsert });

    const ds = new SupabaseUserPreferencesDataSource(client);
    await expect(ds.upsert("ana", { phone: "86999998888" })).rejects.toBeInstanceOf(DataSourceError);
  });
});
