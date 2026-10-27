import { describe, expect, it, vi } from "vitest";
import { SupabaseMessageDataSource } from "@/infra/datasources/supabaseMessageDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DataSourceError } from "@/model/errors";

const sampleRow = {
  id: "msg-1",
  request_id: "req-1",
  sender_id: "user-1",
  content: "Olá! Combinado?",
  created_at: "2026-10-26T12:00:00.000Z",
};

function fakeClient(queryResult: { data: unknown; error: unknown } = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> & { then?: any } = {};
  for (const method of ["select", "eq", "order", "insert"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.single = vi.fn().mockResolvedValue(queryResult);
  chain.then = (onFulfilled: any, onRejected: any) =>
    Promise.resolve(queryResult).then(onFulfilled, onRejected);

  let capturedHandler: ((payload: any) => void) | null = null;
  const mockChannel = {
    on: vi.fn((_event: string, _filter: any, handler: (payload: any) => void) => {
      capturedHandler = handler;
      return mockChannel;
    }),
    subscribe: vi.fn(() => mockChannel),
  };

  const client = {
    from: vi.fn(() => chain),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  } as unknown as SupabaseAppClient;

  return {
    client,
    chain,
    mockChannel,
    triggerPayload: (payload: any) => capturedHandler?.(payload),
  };
}

describe("SupabaseMessageDataSource (Spec 061 / ADR 0044)", () => {
  it("carrega mensagens por requestId mapeando colunas para a entidade", async () => {
    const { client, chain } = fakeClient({ data: [sampleRow], error: null });
    const ds = new SupabaseMessageDataSource(client);
    const result = await ds.getMessagesByRequestId("req-1");

    expect(result).toEqual([
      {
        id: "msg-1",
        requestId: "req-1",
        senderId: "user-1",
        content: "Olá! Combinado?",
        createdAt: "2026-10-26T12:00:00.000Z",
      },
    ]);
    expect(chain.eq).toHaveBeenCalledWith("request_id", "req-1");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("lança DataSourceError quando a leitura falhar", async () => {
    const { client } = fakeClient({ data: null, error: { message: "Erro de banco" } });
    const ds = new SupabaseMessageDataSource(client);

    await expect(ds.getMessagesByRequestId("req-1")).rejects.toBeInstanceOf(DataSourceError);
  });

  it("insere nova mensagem e retorna mapeada", async () => {
    const { client, chain } = fakeClient({ data: sampleRow, error: null });
    const ds = new SupabaseMessageDataSource(client);
    const result = await ds.sendMessage({
      requestId: "req-1",
      senderId: "user-1",
      content: "Olá! Combinado?",
    });

    expect(result).toEqual({
      id: "msg-1",
      requestId: "req-1",
      senderId: "user-1",
      content: "Olá! Combinado?",
      createdAt: "2026-10-26T12:00:00.000Z",
    });
    expect(chain.insert).toHaveBeenCalledWith({
      request_id: "req-1",
      sender_id: "user-1",
      content: "Olá! Combinado?",
    });
  });

  it("lança DataSourceError quando falhar ao inserir mensagem", async () => {
    const { client } = fakeClient({ data: null, error: { message: "Erro de insert" } });
    const ds = new SupabaseMessageDataSource(client);

    await expect(
      ds.sendMessage({
        requestId: "req-1",
        senderId: "user-1",
        content: "Olá!",
      })
    ).rejects.toBeInstanceOf(DataSourceError);
  });

  it("assina mensagens em tempo real e repassa mensagens recebidas para o callback", () => {
    const { client, mockChannel, triggerPayload } = fakeClient();
    const ds = new SupabaseMessageDataSource(client);
    const onMessage = vi.fn();

    const unsubscribe = ds.subscribeToMessages("req-1", onMessage);

    expect(client.channel).toHaveBeenCalledWith(expect.stringMatching(/^negotiation-messages:req-1:\d+$/));
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "v2_negotiation_messages",
        filter: "request_id=eq.req-1",
      },
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();

    // Dispara evento em tempo real
    triggerPayload({ new: sampleRow });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({
      id: "msg-1",
      requestId: "req-1",
      senderId: "user-1",
      content: "Olá! Combinado?",
      createdAt: "2026-10-26T12:00:00.000Z",
    });

    // Cleanup
    unsubscribe();
    expect(client.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
