import { describe, expect, it, vi } from "vitest";
import { MemoryMessageDataSource } from "@/infra/datasources/memoryMessageDataSource";

describe("MemoryMessageDataSource (Spec 061 / ADR 0044)", () => {
  it("armazena e retorna mensagens ordenadas por data", async () => {
    const ds = new MemoryMessageDataSource([
      {
        id: "m2",
        requestId: "req-1",
        senderId: "u2",
        content: "Segunda mensagem",
        createdAt: "2026-10-26T12:05:00.000Z",
      },
      {
        id: "m1",
        requestId: "req-1",
        senderId: "u1",
        content: "Primeira mensagem",
        createdAt: "2026-10-26T12:00:00.000Z",
      },
    ]);

    const messages = await ds.getMessagesByRequestId("req-1");
    expect(messages).toHaveLength(2);
    expect(messages[0].id).toBe("m1");
    expect(messages[1].id).toBe("m2");
  });

  it("filtra mensagens por requestId", async () => {
    const ds = new MemoryMessageDataSource();
    await ds.sendMessage({
      requestId: "req-1",
      senderId: "u1",
      content: "Mensagem do pedido 1",
    });
    await ds.sendMessage({
      requestId: "req-2",
      senderId: "u2",
      content: "Mensagem do pedido 2",
    });

    const req1Messages = await ds.getMessagesByRequestId("req-1");
    expect(req1Messages).toHaveLength(1);
    expect(req1Messages[0].content).toBe("Mensagem do pedido 1");

    const req2Messages = await ds.getMessagesByRequestId("req-2");
    expect(req2Messages).toHaveLength(1);
    expect(req2Messages[0].content).toBe("Mensagem do pedido 2");
  });

  it("notifica ouvintes inscritos ao enviar mensagem para o requestId correto", async () => {
    const ds = new MemoryMessageDataSource();
    const listenerReq1 = vi.fn();
    const listenerReq2 = vi.fn();

    const unsub1 = ds.subscribeToMessages("req-1", listenerReq1);
    ds.subscribeToMessages("req-2", listenerReq2);

    const sent = await ds.sendMessage({
      requestId: "req-1",
      senderId: "u1",
      content: "Alô req 1!",
    });

    expect(listenerReq1).toHaveBeenCalledTimes(1);
    expect(listenerReq1).toHaveBeenCalledWith(sent);
    expect(listenerReq2).not.toHaveBeenCalled();

    // Desinscreve e envia outra mensagem
    unsub1();
    await ds.sendMessage({
      requestId: "req-1",
      senderId: "u1",
      content: "Outra mensagem req 1",
    });

    expect(listenerReq1).toHaveBeenCalledTimes(1); // Não chamado novamente
  });

  it("limpa mensagens e listeners ao chamar clear", async () => {
    const ds = new MemoryMessageDataSource();
    const listener = vi.fn();
    ds.subscribeToMessages("req-1", listener);

    await ds.sendMessage({
      requestId: "req-1",
      senderId: "u1",
      content: "Mensagem antes de clear",
    });
    expect(listener).toHaveBeenCalledTimes(1);

    ds.clear();

    const list = await ds.getMessagesByRequestId("req-1");
    expect(list).toHaveLength(0);

    await ds.sendMessage({
      requestId: "req-1",
      senderId: "u1",
      content: "Mensagem após clear",
    });
    // O listener foi removido pelo clear
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
