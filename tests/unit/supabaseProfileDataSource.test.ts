import { describe, expect, it, vi } from "vitest";
import { SupabaseProfileDataSource } from "@/infra/datasources/supabaseProfileDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(...tableImpls: unknown[]): SupabaseAppClient {
  const queue = [...tableImpls];
  return {
    from: vi.fn().mockImplementation(() => queue.shift()),
  } as unknown as SupabaseAppClient;
}

const row = {
  id: "ana",
  name: "Ana",
  created_at: "2026-01-01T00:00:00Z",
  photo_url: "https://exemplo.com/foto.png",
  social_handle: "@ana",
};

describe("SupabaseProfileDataSource (Spec 006 / Issue #55)", () => {
  it("findById retorna o perfil mapeado", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseProfileDataSource(client);
    const profile = await ds.findById("ana");
    expect(profile).toEqual({
      userId: "ana",
      name: "Ana",
      joinedAt: "2026-01-01T00:00:00Z",
      photoUrl: "https://exemplo.com/foto.png",
      socialHandle: "@ana",
    });
  });

  it("findById retorna null quando não encontrado", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseProfileDataSource(client);
    expect(await ds.findById("ana")).toBeNull();
  });

  it("findById lança DataSourceError em erro de banco", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "falhou" } });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseProfileDataSource(client);
    await expect(ds.findById("ana")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("ensure retorna o perfil existente sem criar de novo", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseProfileDataSource(client);
    const profile = await ds.ensure("ana", "Usuária");
    expect(profile.name).toBe("Ana");
  });

  it("ensure cria o perfil quando ainda não existe", async () => {
    const notFoundSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const notFoundEq = vi.fn().mockReturnValue({ maybeSingle: notFoundSingle });
    const selectNotFound = vi.fn().mockReturnValue({ eq: notFoundEq });

    const upsert = vi.fn().mockResolvedValue({ error: null });

    const foundSingle = vi.fn().mockResolvedValue({ data: { ...row, name: "Usuária" }, error: null });
    const foundEq = vi.fn().mockReturnValue({ maybeSingle: foundSingle });
    const selectFound = vi.fn().mockReturnValue({ eq: foundEq });

    const client = fakeClient({ select: selectNotFound }, { upsert }, { select: selectFound });

    const ds = new SupabaseProfileDataSource(client);
    const profile = await ds.ensure("ana", "Usuária");
    expect(profile.name).toBe("Usuária");
    expect(upsert).toHaveBeenCalledWith(
      { id: "ana", name: "Usuária" },
      { onConflict: "id", ignoreDuplicates: true },
    );
  });

  it("ensure lança DataSourceError quando a criação falha", async () => {
    const notFoundSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const notFoundEq = vi.fn().mockReturnValue({ maybeSingle: notFoundSingle });
    const selectNotFound = vi.fn().mockReturnValue({ eq: notFoundEq });
    const upsert = vi.fn().mockResolvedValue({ error: { message: "falhou" } });
    const client = fakeClient({ select: selectNotFound }, { upsert });

    const ds = new SupabaseProfileDataSource(client);
    await expect(ds.ensure("ana", "Usuária")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("update salva e retorna o perfil atualizado", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq: updateEq });

    const foundSingle = vi.fn().mockResolvedValue({ data: { ...row, name: "Ana Paula" }, error: null });
    const foundEq = vi.fn().mockReturnValue({ maybeSingle: foundSingle });
    const selectFound = vi.fn().mockReturnValue({ eq: foundEq });

    const client = fakeClient({ update }, { select: selectFound });

    const ds = new SupabaseProfileDataSource(client);
    const profile = await ds.update("ana", { name: "Ana Paula", photoUrl: "https://exemplo.com/foto.png", socialHandle: "@ana" });
    expect(profile.name).toBe("Ana Paula");
    expect(update).toHaveBeenCalledWith({
      name: "Ana Paula",
      photo_url: "https://exemplo.com/foto.png",
      social_handle: "@ana",
    });
  });

  it("update lança DataSourceError quando o banco retorna erro", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: { message: "falhou" } });
    const update = vi.fn().mockReturnValue({ eq: updateEq });
    const client = fakeClient({ update });

    const ds = new SupabaseProfileDataSource(client);
    await expect(ds.update("ana", { name: "Ana Paula" })).rejects.toBeInstanceOf(DataSourceError);
  });
});
