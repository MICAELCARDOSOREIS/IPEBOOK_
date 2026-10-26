import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

type MockUseCases = {
  getMessages: (requestId: string, sessionUserId: string) => Promise<NegotiationMessage[]>;
  sendMessage: (params: { requestId: string; senderId: string; content: string }) => Promise<NegotiationMessage>;
  subscribeToMessages?: (requestId: string, onMessage: (msg: NegotiationMessage) => void) => () => void;
};

async function renderChatHook(
  requestId: string,
  sessionUserId: string,
  useCases: MockUseCases
) {
  let result!: ReturnType<typeof useNegotiationChatViewModel>;
  function HookProbe() {
    result = useNegotiationChatViewModel(requestId, sessionUserId, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("Hook useNegotiationChatViewModel (Spec 061 / ADR 0044)", () => {
  const sampleMessages: NegotiationMessage[] = [
    {
      id: "msg-1",
      requestId: "req-1",
      senderId: "user-1",
      content: "Olá! Onde nos encontramos?",
      createdAt: "2026-10-23T10:00:00Z",
    },
  ];

  it("carrega mensagens iniciais com sucesso", async () => {
    const mockUseCases: MockUseCases = {
      getMessages: async () => sampleMessages,
      sendMessage: async () => {
        throw new Error("Não implementado");
      },
    };

    const hook = await renderChatHook("req-1", "user-1", mockUseCases);

    expect(hook.current[0].isLoading).toBe(false);
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].messages[0].content).toBe("Olá! Onde nos encontramos?");
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro ao carregar mensagens", async () => {
    const mockUseCases: MockUseCases = {
      getMessages: async () => {
        throw new Error("Falha de conexão com o banco");
      },
      sendMessage: async () => {
        throw new Error("Não implementado");
      },
    };

    const hook = await renderChatHook("req-1", "user-1", mockUseCases);

    expect(hook.current[0].isLoading).toBe(false);
    expect(hook.current[0].messages).toHaveLength(0);
    expect(hook.current[0].error).toBe("Falha de conexão com o banco");
  });

  it("permite digitar e enviar uma nova mensagem", async () => {
    const mockUseCases: MockUseCases = {
      getMessages: async () => [],
      sendMessage: async (p) => ({
        id: "msg-2",
        requestId: p.requestId,
        senderId: p.senderId,
        content: p.content,
        createdAt: "2026-10-23T10:05:00Z",
      }),
    };

    const hook = await renderChatHook("req-1", "user-1", mockUseCases);

    await act(async () => {
      hook.current[1].setInputText("Chegando no Campus IFPI!");
    });

    expect(hook.current[0].inputText).toBe("Chegando no Campus IFPI!");

    let sendSuccess = false;
    await act(async () => {
      sendSuccess = await hook.current[1].sendMessage();
    });

    expect(sendSuccess).toBe(true);
    expect(hook.current[0].inputText).toBe("");
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].messages[0].content).toBe("Chegando no Campus IFPI!");
    expect(hook.current[0].sendError).toBeNull();
  });

  it("trata falha de envio e permite retentativa (Figma 06.10)", async () => {
    let failFirst = true;
    const mockUseCases: MockUseCases = {
      getMessages: async () => [],
      sendMessage: async (p) => {
        if (failFirst) {
          failFirst = false;
          throw new Error("Falha na rede ao enviar mensagem.");
        }
        return {
          id: "msg-3",
          requestId: p.requestId,
          senderId: p.senderId,
          content: p.content,
          createdAt: "2026-10-23T10:10:00Z",
        };
      },
    };

    const hook = await renderChatHook("req-1", "user-1", mockUseCases);

    await act(async () => {
      hook.current[1].setInputText("Tentativa com falha");
    });

    let sendSuccess = false;
    await act(async () => {
      sendSuccess = await hook.current[1].sendMessage();
    });

    expect(sendSuccess).toBe(false);
    expect(hook.current[0].sendError).toBe("Falha na rede ao enviar mensagem.");

    // Retenta a mensagem que falhou
    let retrySuccess = false;
    await act(async () => {
      retrySuccess = await hook.current[1].retryLastMessage();
    });

    expect(retrySuccess).toBe(true);
    expect(hook.current[0].sendError).toBeNull();
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].messages[0].content).toBe("Tentativa com falha");
  });

  it("assina mensagens em tempo real e adiciona novas mensagens sem duplicações", async () => {
    let capturedCallback: ((msg: NegotiationMessage) => void) | null = null;
    const unsubscribeMock = vi.fn();

    const mockUseCases: MockUseCases = {
      getMessages: async () => sampleMessages,
      sendMessage: async () => {
        throw new Error("Não implementado");
      },
      subscribeToMessages: vi.fn((requestId, onMessage) => {
        expect(requestId).toBe("req-1");
        capturedCallback = onMessage;
        return unsubscribeMock;
      }),
    };

    const hook = await renderChatHook("req-1", "user-1", mockUseCases);

    expect(mockUseCases.subscribeToMessages).toHaveBeenCalledTimes(1);
    expect(hook.current[0].messages).toHaveLength(1);

    // Nova mensagem recebida via WebSocket/Realtime
    const incomingMessage: NegotiationMessage = {
      id: "msg-rt-1",
      requestId: "req-1",
      senderId: "user-2",
      content: "Estou no portão da frente!",
      createdAt: "2026-10-23T10:15:00Z",
    };

    await act(async () => {
      capturedCallback?.(incomingMessage);
    });

    expect(hook.current[0].messages).toHaveLength(2);
    expect(hook.current[0].messages[1].content).toBe("Estou no portão da frente!");

    // Tentar adicionar a mesma mensagem novamente (não deve duplicar)
    await act(async () => {
      capturedCallback?.(incomingMessage);
    });

    expect(hook.current[0].messages).toHaveLength(2);
  });

  it("executa cleanup ao desmontar o componente", async () => {
    const unsubscribeMock = vi.fn();
    const mockUseCases: MockUseCases = {
      getMessages: async () => [],
      sendMessage: async () => {
        throw new Error("Não implementado");
      },
      subscribeToMessages: vi.fn(() => unsubscribeMock),
    };

    await renderChatHook("req-1", "user-1", mockUseCases);
    expect(unsubscribeMock).not.toHaveBeenCalled();

    // Desmonta todas as árvores montadas
    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
