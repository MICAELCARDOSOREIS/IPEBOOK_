import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

type MockUseCases = {
  getMessages: (requestId: string, sessionUserId: string) => Promise<NegotiationMessage[]>;
  sendMessage: (params: { requestId: string; senderId: string; content: string }) => Promise<NegotiationMessage>;
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
});
