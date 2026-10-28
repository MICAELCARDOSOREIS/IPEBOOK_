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

  it("findById retorna pushToken quando presente na coluna push_token", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: "ExponentPushToken[mock-token-123]",
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toEqual({
      userId: "ana",
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: "ExponentPushToken[mock-token-123]",
    });
  });

  it("findById retorna pushToken como null quando explicitamente nulo no banco", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: null,
        neighborhood: null,
        push_token: null,
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toEqual({
      userId: "ana",
      phone: undefined,
      neighborhood: undefined,
      pushToken: null,
    });
  });

  it("findById traz mutedTypes quando a coluna muted_types vem do banco (Spec 099)", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: null,
        muted_types: ["search_alert_match", "system"],
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toEqual({
      userId: "ana",
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: null,
      mutedTypes: ["search_alert_match", "system"],
    });
  });

  it("upsert grava muted_types quando informado (Spec 099)", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: null,
        neighborhood: null,
        push_token: null,
        muted_types: ["meeting_update"],
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    const result = await ds.upsert("ana", { mutedTypes: ["meeting_update"] });

    expect(result.mutedTypes).toEqual(["meeting_update"]);
    expect(upsert.mock.calls[0][0]).toMatchObject({ user_id: "ana", muted_types: ["meeting_update"] });
  });

  it("lança erro quando o upsert não consegue reler a linha salva", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    await expect(ds.upsert("ana", { phone: "86999998888" })).rejects.toThrow(
      "Não foi possível salvar as preferências.",
    );
  });

  it("findById trata muted_types nulo como lista vazia (Spec 099)", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: null,
        neighborhood: null,
        push_token: null,
        muted_types: null,
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    expect(await ds.findById("ana")).toEqual({
      userId: "ana",
      phone: undefined,
      neighborhood: undefined,
      pushToken: null,
      mutedTypes: [],
    });
  });

  it("upsert salva push_token quando informado", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: "ExponentPushToken[token-456]",
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    const result = await ds.upsert("ana", {
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: "ExponentPushToken[token-456]",
    });

    expect(result).toEqual({
      userId: "ana",
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: "ExponentPushToken[token-456]",
    });
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: "ExponentPushToken[token-456]",
      },
      { onConflict: "user_id" },
    );
  });

  it("upsert permite atualizar push_token para null (desregistro)", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: null,
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    const result = await ds.upsert("ana", { pushToken: null });

    expect(result.pushToken).toBeNull();
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "ana",
        phone: null,
        neighborhood: null,
        push_token: null,
      },
      { onConflict: "user_id" },
    );
  });

  it("upsertPreferences delega para upsert", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "ana",
        phone: "86999998888",
        neighborhood: "Centro",
        push_token: "ExponentPushToken[xyz]",
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const client = fakeClient({ upsert }, { select });

    const ds = new SupabaseUserPreferencesDataSource(client);
    const result = await ds.upsertPreferences("ana", { pushToken: "ExponentPushToken[xyz]" });

    expect(result.pushToken).toBe("ExponentPushToken[xyz]");
  });
});
