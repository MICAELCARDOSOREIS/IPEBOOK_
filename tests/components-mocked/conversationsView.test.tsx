import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { ConversationItem, ConversationsState } from "@/viewmodel/useConversationsViewModel";
import { Conversations } from "@/view/conversations/conversations";

vi.mock("@/viewmodel/useConversationsViewModel", () => ({ useConversationsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));

import { useConversationsViewModel } from "@/viewmodel/useConversationsViewModel";

const listing = (id: string, title: string): Book => ({
  id, title, author: "A", ownerId: "x", modality: "trade", status: "available",
});

function setup(state: Partial<ConversationsState>) {
  vi.mocked(useConversationsViewModel).mockReturnValue([
    { items: [], loading: false, error: null, ...state },
    { reload: vi.fn() },
  ]);
}

async function renderView(props: Partial<Parameters<typeof Conversations>[0]> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Conversations sessionUserId="me" {...props} />);
  });
  return screen;
}

describe("Conversations (Spec 076)", () => {
  const items: ConversationItem[] = [
    { requestId: "r1", listing: listing("b1", "Dom Casmurro"), otherName: "Ana Paula", preview: "Pode ser sábado na praça?", time: "9h", kind: "accepted" },
    { requestId: "r2", listing: listing("b2", "Vidas Secas"), otherName: "Lucas", preview: "Proposta recebida", time: null, kind: "pendingReceived" },
    { requestId: "r3", listing: listing("b3", "Iracema"), otherName: "Marina", preview: "Aguardando resposta", time: null, kind: "pendingSent" },
  ];

  it("lista pessoa, prévia, horário e livro; aceita abre a conversa (Spec 076 CA4, Spec 082 CA5)", async () => {
    setup({ items });
    const onOpenChat = vi.fn();
    const onOpenReceivedRequests = vi.fn();
    const onOpenListing = vi.fn();
    const screen = await renderView({ onOpenChat, onOpenReceivedRequests, onOpenListing });

    expect(screen.getByRole("header").props.children).toBe("Conversas");
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("Pode ser sábado na praça?")).toBeDefined();
    expect(screen.getByText("9h")).toBeDefined();
    expect(screen.getByText("Sobre Dom Casmurro")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByText("Ana Paula")); });
    expect(onOpenChat).toHaveBeenCalledWith("r1");
    await act(async () => { fireEvent.press(screen.getByText("Lucas")); });
    expect(onOpenReceivedRequests).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent.press(screen.getByText("Marina")); });
    expect(onOpenListing).toHaveBeenCalledWith("b3");
  });

  it("mostra o estado vazio do 06.09 com Encontrar um livro (Spec 082)", async () => {
    setup({ items: [] });
    const onExplore = vi.fn();
    const screen = await renderView({ onExplore });
    expect(screen.getByText("Nenhuma conversa ainda")).toBeDefined();
    expect(screen.getByText("Encontre um livro e converse com a pessoa para combinar os detalhes.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Encontrar um livro")); });
    expect(onExplore).toHaveBeenCalledTimes(1);
  });

  it("mostra carregamento e erro com nova tentativa", async () => {
    setup({ loading: true });
    const loading = await renderView();
    expect(loading.getByLabelText("Carregando conversas")).toBeDefined();

    setup({ error: "Não foi possível carregar suas conversas. Tente novamente." });
    const failed = await renderView();
    expect(failed.getByText("Não foi possível carregar suas conversas. Tente novamente.")).toBeDefined();
  });
});
