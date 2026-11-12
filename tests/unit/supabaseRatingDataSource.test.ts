import { describe, expect, it, vi } from "vitest";
import { SupabaseRatingDataSource } from "@/infra/datasources/supabaseRatingDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

const row = {
  id: "r1",
  rater_id: "bob",
  rated_user_id: "ana",
  request_id: "req1",
  score: 5,
  created_at: "2026-01-02T00:00:00Z",
};

function fakeClient(tableImpl: unknown): SupabaseAppClient {
  return { from: vi.fn().mockReturnValue(tableImpl) } as unknown as SupabaseAppClient;
}

describe("SupabaseRatingDataSource (Spec 063 / ADR 0046)", () => {
  it("create insere, devolve a linha mapeada e exige dados", async () => {
    const single = vi.fn().mockResolvedValue({ data: row, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const ds = new SupabaseRatingDataSource(fakeClient({ insert: vi.fn().mockReturnValue({ select }) }));

    const created = await ds.create({ raterId: "bob", ratedUserId: "ana", requestId: "req1", score: 5 });
    expect(created).toEqual({
      id: "r1",
      raterId: "bob",
      ratedUserId: "ana",
      requestId: "req1",
      score: 5,
      createdAt: "2026-01-02T00:00:00Z",
    });
  });

  it("create lança quando o banco falha ou não devolve linha", async () => {
    const comErro = { insert: vi.fn().mockReturnValue({ select: () => ({ single: () => Promise.resolve({ data: row, error: { message: "x" } }) }) }) };
    await expect(new SupabaseRatingDataSource(fakeClient(comErro)).create({ raterId: "b", ratedUserId: "a", requestId: "r", score: 4 }))
      .rejects.toBeInstanceOf(DataSourceError);

    const semData = { insert: vi.fn().mockReturnValue({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    await expect(new SupabaseRatingDataSource(fakeClient(semData)).create({ raterId: "b", ratedUserId: "a", requestId: "r", score: 4 }))
      .rejects.toBeInstanceOf(DataSourceError);
  });

  it("listByRatedUser mapeia linhas e lança em erro de banco", async () => {
    const ok = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [row], error: null }) }) };
    const ds = new SupabaseRatingDataSource(fakeClient(ok));
    expect(await ds.listByRatedUser("ana")).toEqual([
      { id: "r1", raterId: "bob", ratedUserId: "ana", requestId: "req1", score: 5, createdAt: "2026-01-02T00:00:00Z" },
    ]);
    expect(ok.select).toHaveBeenCalled();

    const fail = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: { message: "x" } }) }) };
    await expect(new SupabaseRatingDataSource(fakeClient(fail)).listByRatedUser("ana")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("findByRequestAndRater devolve null quando não há avaliação e lança em erro", async () => {
    const encadeamento = (result: Promise<unknown>) => {
      const maybeSingle = vi.fn().mockReturnValue(result);
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      return { select: vi.fn().mockReturnValue({ eq: eq1 }) };
    };

    const achado = encadeamento(Promise.resolve({ data: row, error: null }));
    expect((await new SupabaseRatingDataSource(fakeClient(achado)).findByRequestAndRater("req1", "bob"))?.id).toBe("r1");

    const vazio = encadeamento(Promise.resolve({ data: null, error: null }));
    expect(await new SupabaseRatingDataSource(fakeClient(vazio)).findByRequestAndRater("req1", "bob")).toBeNull();

    const falho = encadeamento(Promise.resolve({ data: null, error: { message: "x" } }));
    await expect(new SupabaseRatingDataSource(fakeClient(falho)).findByRequestAndRater("req1", "bob")).rejects.toBeInstanceOf(DataSourceError);
  });
});
