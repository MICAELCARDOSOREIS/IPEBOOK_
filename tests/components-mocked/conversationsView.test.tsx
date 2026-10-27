import { act, fireEvent, render } from "@testing-library/react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { ConversationItem, ConversationsState } from "@/viewmodel/useConversationsViewModel";
import { Conversations } from "@/view/conversations/conversations";

vi.mock("@/viewmodel/useConversationsViewModel", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/viewmodel/useConversationsViewModel")>()),
  useConversationsViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));

import { useConversationsViewModel } from "@/viewmodel/useConversationsViewModel";

const listing = (id: string, title: string): Book => ({
  id, title, author: "A", ownerId: "x", modality: "trade", status: "available",
});

const deleteConversation = vi.fn().mockResolvedValue(true);

function setup(state: Partial<ConversationsState>) {
  vi.mocked(useConversationsViewModel).mockReturnValue([
    { items: [], loading: false, error: null, ...state },
    { reload: vi.fn(), deleteConversation },
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
  // O horário é calculado na tela (Spec 089); fixa só o relógio para o resultado ser previsível.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(new Date("2026-10-26T15:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const items: ConversationItem[] = [
    { requestId: "r1", listing: listing("b1", "Dom Casmurro"), otherName: "Ana Paula", otherPhotoUrl: null, preview: "Pode ser sábado na praça?", lastMessageAt: "2026-10-26T06:00:00", kind: "accepted" },
    { requestId: "r2", listing: listing("b2", "Vidas Secas"), otherName: "Lucas", otherPhotoUrl: null, preview: "Proposta recebida", lastMessageAt: null, kind: "pendingReceived" },
    { requestId: "r3", listing: listing("b3", "Iracema"), otherName: "Marina", otherPhotoUrl: null, preview: "Aguardando resposta", lastMessageAt: null, kind: "pendingSent" },
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

  it("destaca a proposta recebida com o selo Nova proposta (Spec 089)", async () => {
    setup({ items });
    const screen = await renderView();
    expect(screen.getAllByText("Nova proposta")).toHaveLength(1);
    expect(screen.queryByText("Nova proposta", { exact: true })).not.toBeNull();
  });

  it("atualiza o rótulo de tempo sem recarregar a lista (Spec 089)", async () => {
    setup({ items });
    const screen = await renderView();
    expect(screen.getByText("9h")).toBeDefined();
    await act(async () => { vi.setSystemTime(new Date("2026-10-26T16:10:00")); vi.advanceTimersByTime(60_000); });
    expect(screen.getByText("10h")).toBeDefined();
  });

  it("apaga a conversa aceita com toque longo e confirmação (Spec 090)", async () => {
    setup({ items });
    deleteConversation.mockClear();
    const screen = await renderView();
    await act(async () => { fireEvent(screen.getByText("Ana Paula"), "longPress"); });
    expect(screen.getByText("Apagar conversa?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Apagar")); });
    expect(deleteConversation).toHaveBeenCalledWith("r1");
  });

  it("não oferece apagar em proposta pendente (Spec 090)", async () => {
    setup({ items });
    const screen = await renderView();
    await act(async () => { fireEvent(screen.getByText("Lucas"), "longPress"); });
    expect(screen.queryByText("Apagar conversa?")).toBeNull();
  });
});
