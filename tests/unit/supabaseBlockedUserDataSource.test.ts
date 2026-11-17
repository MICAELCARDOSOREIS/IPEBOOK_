import { SupabaseBlockedUserDataSource } from "@/infra/datasources/supabaseBlockedUserDataSource";
import { DataSourceError } from "@/model/errors";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(...tableImpls: unknown[]): SupabaseAppClient {
  const queue = [...tableImpls];
  return {
    from: jest.fn().mockImplementation(() => queue.shift()),
  } as unknown as SupabaseAppClient;
}

/** Encadeia select→eq→order (listBlocked) e select→or→limit (isBlocked). */
function selectChain(result: Promise<unknown>) {
  const limit = jest.fn().mockReturnValue(result);
  const or = jest.fn().mockReturnValue({ limit });
  const order = jest.fn().mockReturnValue(result);
  const eq = jest.fn().mockReturnValue({ order, or, limit });
  const select = jest.fn().mockReturnValue({ eq, or });
  return { select, eq, or, order, limit };
}

function profileWith(name: string | null, photoUrl?: string): IProfileDataSource {
  return {
    findById: jest.fn().mockResolvedValue(name ? { userId: "x", name, photoUrl, joinedAt: "" } : null),
  } as unknown as IProfileDataSource;
}

describe("SupabaseBlockedUserDataSource (Spec 056 / ADR 0039)", () => {
  it("listBlocked lança DataSourceError em erro de banco", async () => {
    const { select } = selectChain(Promise.resolve({ data: null, error: { message: "falhou" } }));
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ select }));
    await expect(ds.listBlocked("ana")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("listBlocked cai no nome genérico sem fonte de perfis", async () => {
    const { select } = selectChain(
      Promise.resolve({ data: [{ blocked_id: "bob", created_at: "2026-01-02T00:00:00Z" }], error: null }),
    );
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ select }));
    expect(await ds.listBlocked("ana")).toEqual([
      { userId: "bob", name: "Membro da comunidade", blockedAt: "2026-01-02T00:00:00Z", photoUrl: undefined },
    ]);
  });

  it("listBlocked completa nome e foto do perfil quando disponível", async () => {
    const { select } = selectChain(
      Promise.resolve({ data: [{ blocked_id: "bob", created_at: "2026-01-02T00:00:00Z" }], error: null }),
    );
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ select }), profileWith("Bob", "https://exemplo.com/bob.png"));
    const items = await ds.listBlocked("ana");
    expect(items[0]).toMatchObject({ name: "Bob", photoUrl: "https://exemplo.com/bob.png" });
  });

  it("listBlocked preserva o fallback quando a leitura do perfil falha", async () => {
    const { select } = selectChain(
      Promise.resolve({ data: [{ blocked_id: "bob", created_at: "2026-01-02T00:00:00Z" }], error: null }),
    );
    const falho = { findById: jest.fn().mockRejectedValue(new Error("banco fora")) } as unknown as IProfileDataSource;
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ select }), falho);
    const items = await ds.listBlocked("ana");
    expect(items[0]).toMatchObject({ userId: "bob", name: "Membro da comunidade" });
  });

  it("listBlocked retorna vazio quando data é null", async () => {
    const { select } = selectChain(Promise.resolve({ data: null, error: null }));
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ select }));
    expect(await ds.listBlocked("ana")).toEqual([]);
  });

  it("block grava o par e trata duplicidade (23505) como sucesso", async () => {
    const insert = jest.fn().mockResolvedValue({ error: { code: "23505" } });
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ insert }));
    await expect(ds.block("ana", "bob")).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith({ blocker_id: "ana", blocked_id: "bob" });
  });

  it("block lança DataSourceError em erro de banco", async () => {
    const insert = jest.fn().mockResolvedValue({ error: { code: "42501" } });
    const ds = new SupabaseBlockedUserDataSource(fakeClient({ insert }));
    await expect(ds.block("ana", "bob")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("unblock remove o par e lança em erro de banco", async () => {
    const okEq = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    await new SupabaseBlockedUserDataSource(fakeClient({ delete: () => ({ eq: okEq }) })).unblock("ana", "bob");

    const failEq = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: { message: "falhou" } }) });
    await expect(
      new SupabaseBlockedUserDataSource(fakeClient({ delete: () => ({ eq: failEq }) })).unblock("ana", "bob"),
    ).rejects.toBeInstanceOf(DataSourceError);
  });

  it("isBlocked considera qualquer linha encontrada nos dois sentidos", async () => {
    const { select } = selectChain(Promise.resolve({ data: [{ blocker_id: "bob" }], error: null }));
    expect(await new SupabaseBlockedUserDataSource(fakeClient({ select })).isBlocked("ana", "bob")).toBe(true);

    const vazio = selectChain(Promise.resolve({ data: [], error: null }));
    expect(await new SupabaseBlockedUserDataSource(fakeClient({ select: vazio.select })).isBlocked("ana", "bob")).toBe(false);
  });

  it("isBlocked responde false em erro de banco (falha aberta só para restrição extra)", async () => {
    const { select } = selectChain(Promise.resolve({ data: null, error: { message: "falhou" } }));
    expect(await new SupabaseBlockedUserDataSource(fakeClient({ select })).isBlocked("ana", "bob")).toBe(false);
  });
});
