import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { NegotiationChatState } from "@/viewmodel/useNegotiationChatViewModel";
import { Chat } from "@/view/conversations/chat";

vi.mock("@/viewmodel/useRequestDetailViewModel", () => ({ useRequestDetailViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNegotiationChatViewModel", () => ({ useNegotiationChatViewModel: vi.fn() }));
// Entrega por QR (Spec 095): começa sem conclusão.
let deliveryCompleted: Record<string, unknown> | null = null;
vi.mock("@/viewmodel/useDeliveryViewModel", () => ({
  useDeliveryStatus: () => ({ loading: false, role: "receiver", completed: deliveryCompleted }),
}));

import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";

const book: Book = { id: "b1", title: "Dom Casmurro", author: "Machado", ownerId: "ana", modality: "trade", status: "reserved" };

function setup(chat: Partial<NegotiationChatState> = {}) {
  vi.mocked(useRequestDetailViewModel).mockReturnValue([
    {
      detail: {
        request: { id: "r1", listingId: "b1", requesterId: "me", status: "accepted" },
        book,
        isOwner: false,
        counterpartId: "ana",
        counterpartName: "Ana Paula",
        counterpartPhotoUrl: "https://cdn/ana.jpg",
        safeMeetingPoints: [],
      },
      loading: false,
      error: null,
    },
    { reload: vi.fn() },
  ]);
  const actions = { setInputText: vi.fn(), sendMessage: vi.fn().mockResolvedValue(true), retryLastMessage: vi.fn(), reload: vi.fn() };
  vi.mocked(useNegotiationChatViewModel).mockReturnValue([
    { messages: [], inputText: "", isLoading: false, isSending: false, error: null, sendError: null, ...chat },
    actions,
  ]);
  return actions;
}

async function renderChat(props: Partial<Parameters<typeof Chat>[0]> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Chat requestId="r1" sessionUserId="me" {...props} />);
  });
  return screen;
}

describe("Chat em tela cheia (Spec 082)", () => {
  it("mostra a pessoa, o livro e Combinar abre a negociação (CA2)", async () => {
    setup();
    const onOpenNegotiation = vi.fn();
    const screen = await renderChat({ onOpenNegotiation });
    expect(screen.getByRole("header").props.children).toBe("Ana Paula");
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Troca")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Combinar")); });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("separa balões meus e da outra pessoa com horário e envia pelo botão (CA3)", async () => {
    const actions = setup({
      inputText: "Combinado",
      messages: [
        { id: "m1", requestId: "r1", senderId: "ana", content: "Pode ser sábado?", createdAt: "2026-10-26T09:02:00" },
        { id: "m2", requestId: "r1", senderId: "me", content: "Pode sim", createdAt: "2026-10-26T09:05:00" },
      ],
    });
    const screen = await renderChat();
    expect(screen.getByLabelText("Ana Paula às 9h02: Pode ser sábado?")).toBeDefined();
    expect(screen.getByLabelText("Você às 9h05: Pode sim")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Enviar mensagem")); });
    expect(actions.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("na conversa vazia, a sugestão preenche o campo (CA4)", async () => {
    const actions = setup();
    const screen = await renderChat();
    expect(screen.getByText("Comece a conversa")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("O livro ainda está disponível?")); });
    expect(actions.setInputText).toHaveBeenCalledWith("O livro ainda está disponível?");
  });

  it("mostra a foto da pessoa no cabeçalho e Voltar funciona (Spec 089)", async () => {
    setup();
    const onBack = vi.fn();
    const screen = await renderChat({ onBack });
    expect(screen.getByLabelText("Ana Paula")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("Combinar é um botão com rótulo acessível (Spec 089)", async () => {
    setup();
    const onOpenNegotiation = vi.fn();
    const screen = await renderChat({ onOpenNegotiation });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Combinar encontro na negociação" })); });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("depois da entrega concluída, o chat não oferece mais o Combinar (Spec 095)", async () => {
    setup();
    deliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    deliveryCompleted = null;
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.queryByLabelText("Combinar encontro na negociação")).toBeNull();
  });

  it("depois da entrega concluída, a conversa vira só consulta, sem campo de mensagem", async () => {
    setup();
    deliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    deliveryCompleted = null;
    expect(screen.getByText("Negociação concluída. A conversa ficou só para consulta.")).toBeDefined();
    expect(screen.queryByLabelText("Campo de mensagem")).toBeNull();
    expect(screen.queryByLabelText("Enviar mensagem")).toBeNull();
  });

  it("embutido na web larga, omite Voltar, Combinar e o cartão do livro (o painel lateral já oferece)", async () => {
    setup();
    const screen = await renderChat({ embedded: true });
    expect(screen.queryByText("Dom Casmurro")).toBeNull();
    expect(screen.queryByLabelText("Voltar")).toBeNull();
    expect(screen.queryByLabelText("Combinar encontro na negociação")).toBeNull();
  });

  it("mostra a falha de envio com Reenviar", async () => {
    const actions = setup({ sendError: "Sem conexão." });
    const screen = await renderChat();
    expect(screen.getByText("Sem conexão.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Reenviar")); });
    expect(actions.retryLastMessage).toHaveBeenCalledTimes(1);
  });
});
