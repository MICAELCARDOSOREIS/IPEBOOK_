import { describe, expect, it, vi } from "vitest";
import { SupabaseFavoriteDataSource } from "@/infra/datasources/supabaseFavoriteDataSource";
import { SupabaseSearchAlertDataSource } from "@/infra/datasources/supabaseSearchAlertDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function client(result: { data: unknown; error: unknown }) {
  const query: Record<string, unknown> = {};
  for (const name of ["select", "eq", "order", "insert", "delete", "update", "single"]) {
    query[name] = vi.fn().mockReturnValue(query);
  }
  query.then = (resolve: (value: unknown) => void) => Promise.resolve(result).then(resolve);
  return { value: { from: vi.fn().mockReturnValue(query) } as unknown as SupabaseAppClient, query };
}

const favorite = { id: "f1", user_id: "u1", book_id: "b1", created_at: "2026-10-15T00:00:00Z" };
const alert = { id: "a1", user_id: "u1", query: "Casmurro", active: true, created_at: "2026-10-15T00:00:00Z" };

describe("persistência Supabase de favoritos e alertas", () => {
  it("lista, cria e remove somente favoritos da conta", async () => {
    const listed = client({ data: [favorite], error: null });
    expect(await new SupabaseFavoriteDataSource(listed.value).listByUser("u1")).toEqual([{ id: "f1", userId: "u1", bookId: "b1", createdAt: favorite.created_at }]);
    expect(listed.query.eq).toHaveBeenCalledWith("user_id", "u1");
    const added = client({ data: favorite, error: null });
    expect((await new SupabaseFavoriteDataSource(added.value).add("u1", "b1")).bookId).toBe("b1");
    const removed = client({ data: null, error: null });
    await new SupabaseFavoriteDataSource(removed.value).remove("u1", "b1");
    expect(removed.query.eq).toHaveBeenCalledWith("book_id", "b1");
  });

  it("converte falhas do provedor em erros de domínio para favoritos", async () => {
    const failed = client({ data: null, error: new Error("interno") });
    const source = new SupabaseFavoriteDataSource(failed.value);
    await expect(source.listByUser("u1")).rejects.toThrow("Não foi possível carregar favoritos.");
    await expect(source.add("u1", "b1")).rejects.toThrow("Não foi possível favoritar o anúncio.");
    await expect(source.remove("u1", "b1")).rejects.toThrow("Não foi possível remover o favorito.");
  });

  it("lista, cria, pausa e remove alertas da conta", async () => {
    const listed = client({ data: [alert], error: null });
    expect((await new SupabaseSearchAlertDataSource(listed.value).listByUser("u1"))[0].query).toBe("Casmurro");
    const added = client({ data: alert, error: null });
    expect((await new SupabaseSearchAlertDataSource(added.value).add("u1", "Casmurro")).active).toBe(true);
    const updated = client({ data: [{ id: "a1" }], error: null });
    await new SupabaseSearchAlertDataSource(updated.value).setActive("u1", "a1", false);
    expect(updated.query.eq).toHaveBeenCalledWith("user_id", "u1");
    const edited = client({ data: [{ id: "a1" }], error: null });
    await new SupabaseSearchAlertDataSource(edited.value).update("u1", "a1", "Iracema");
    expect(edited.query.update).toHaveBeenCalledWith({ query: "Iracema" });
    expect(edited.query.eq).toHaveBeenCalledWith("user_id", "u1");
    const removed = client({ data: null, error: null });
    await new SupabaseSearchAlertDataSource(removed.value).remove("u1", "a1");
  });

  it("converte falhas do provedor em erros de domínio para alertas", async () => {
    const failed = client({ data: null, error: new Error("interno") });
    const source = new SupabaseSearchAlertDataSource(failed.value);
    await expect(source.listByUser("u1")).rejects.toThrow("Não foi possível carregar alertas.");
    await expect(source.add("u1", "Casmurro")).rejects.toThrow("Não foi possível criar o alerta.");
    await expect(source.setActive("u1", "a1", false)).rejects.toThrow("Não foi possível atualizar o alerta.");
    await expect(source.update("u1", "a1", "Iracema")).rejects.toThrow("Não foi possível atualizar o alerta.");
    await expect(source.remove("u1", "a1")).rejects.toThrow("Não foi possível excluir o alerta.");
  });
});
