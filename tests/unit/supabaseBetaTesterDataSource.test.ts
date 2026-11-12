import { describe, expect, it, vi } from "vitest";
import { SupabaseBetaTesterDataSource } from "@/infra/datasources/supabaseBetaTesterDataSource";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function clientWith(rpc: ReturnType<typeof vi.fn>): SupabaseAppClient {
  return { rpc } as unknown as SupabaseAppClient;
}

describe("SupabaseBetaTesterDataSource (Spec 108)", () => {
  it("registra a inscrição chamando a RPC com e-mail e nome", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const dataSource = new SupabaseBetaTesterDataSource(clientWith(rpc));

    await dataSource.register({ email: "ana@exemplo.com", name: "Ana Paula" });

    expect(rpc).toHaveBeenCalledWith("v2_register_beta_tester", {
      p_email: "ana@exemplo.com",
      p_name: "Ana Paula",
    });
  });

  it("envia nome nulo quando a inscrição não informa o nome", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const dataSource = new SupabaseBetaTesterDataSource(clientWith(rpc));

    await dataSource.register({ email: "beto@exemplo.com" });

    expect(rpc).toHaveBeenCalledWith("v2_register_beta_tester", {
      p_email: "beto@exemplo.com",
      p_name: null,
    });
  });

  it("traduz o erro do banco em DataSourceError", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: { message: "falhou", code: "P0001" } });
    const dataSource = new SupabaseBetaTesterDataSource(clientWith(rpc));

    await expect(dataSource.register({ email: "ana@exemplo.com" })).rejects.toBeInstanceOf(
      DataSourceError,
    );
  });
});
