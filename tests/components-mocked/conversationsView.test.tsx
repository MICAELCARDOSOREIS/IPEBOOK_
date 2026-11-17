import { act, fireEvent, render } from "@testing-library/react-native";
import * as container from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { ConversationItem, ConversationsState } from "@/viewmodel/useConversationsViewModel";
import ConversationsScreen, { Conversations } from "@/view/conversations/conversations";

jest.mock("@/viewmodel/useConversationsViewModel", () => ({
  ...jest.requireActual<typeof import("@/viewmodel/useConversationsViewModel")>("@/viewmodel/useConversationsViewModel"),
  useConversationsViewModel: jest.fn(),
}));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: jest.fn(() => ({ isOnline: true })) }));

import { useConversationsViewModel } from "@/viewmodel/useConversationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

const listing = (id: string, title: string, status: Book["status"] = "available"): Book => ({
  id, title, author: "A", ownerId: "x", modality: "trade", status,
});

const deleteConversation = jest.fn().mockResolvedValue(true);
const cancelRequest = jest.fn().mockResolvedValue(true);

function setup(state: Partial<ConversationsState>) {
  const reload = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useConversationsViewModel).mockReturnValue([
    { items: [], loading: false, error: null, ...state },
    { reload, deleteConversation, cancelRequest },
  ]);
  return { reload };
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
    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "clearImmediate", "setTimeout", "clearTimeout", "queueMicrotask", "performance", "hrtime"],
    });
    jest.setSystemTime(new Date("2026-10-26T15:00:00"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const items: ConversationItem[] = [
    { requestId: "r1", listing: listing("b1", "Dom Casmurro"), otherName: "Ana Paula", otherPhotoUrl: null, preview: "Pode ser sábado na praça?", lastMessageAt: "2026-10-26T06:00:00", kind: "accepted" },
    { requestId: "r2", listing: listing("b2", "Vidas Secas"), otherName: "Lucas", otherPhotoUrl: null, preview: "Proposta recebida", lastMessageAt: null, kind: "pendingReceived" },
    { requestId: "r3", listing: listing("b3", "Iracema"), otherName: "Marina", otherPhotoUrl: null, preview: "Aguardando resposta", lastMessageAt: null, kind: "pendingSent" },
  ];

  it("lista pessoa, prévia, horário e livro; aceita abre a conversa (Spec 076 CA4, Spec 082 CA5)", async () => {
    setup({ items });
    const onOpenChat = jest.fn();
    const onOpenReceivedRequests = jest.fn();
    const onOpenListing = jest.fn();
    const screen = await renderView({ onOpenChat, onOpenReceivedRequests, onOpenListing });

    expect(screen.getByRole("header").props.children).toBe("Conversas");
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("Pode ser sábado na praça?")).toBeDefined();
    expect(screen.getByText("9h")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getAllByText("Troca").length).toBeGreaterThan(0);

    await act(async () => { fireEvent.press(screen.getByText("Ana Paula")); });
    expect(onOpenChat).toHaveBeenCalledWith("r1");
    await act(async () => { fireEvent.press(screen.getByText("Lucas")); });
    expect(onOpenChat).toHaveBeenCalledWith("r2");
    await act(async () => { fireEvent.press(screen.getByText(/nova proposta recebida/i)); });
    expect(onOpenReceivedRequests).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent.press(screen.getByText("Marina")); });
    expect(onOpenListing).toHaveBeenCalledWith("b3");
  });

  it("recarrega a lista quando a tela volta ao foco (regressão: selo Nova proposta ficava após aceitar)", async () => {
    const reload = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useConversationsViewModel).mockReturnValue([
      { items, loading: false, error: null },
      { reload, deleteConversation, cancelRequest },
    ]);
    const screen = await renderView({ focusKey: 1 });
    expect(reload).not.toHaveBeenCalled();

    await act(async () => {
      screen.rerender(<Conversations sessionUserId="me" focusKey={2} />);
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado vazio do 06.09 com Encontrar um livro (Spec 082)", async () => {
    setup({ items: [] });
    const onExplore = jest.fn();
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
    await act(async () => { jest.setSystemTime(new Date("2026-10-26T16:10:00")); jest.advanceTimersByTime(60_000); });
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

  it("cancela o pedido enviado pendente com confirmação (Spec 101)", async () => {
    setup({ items });
    cancelRequest.mockClear();
    const screen = await renderView();
    expect(screen.getAllByText("Cancelar pedido")).toHaveLength(1);
    await act(async () => { fireEvent.press(screen.getByLabelText("Cancelar pedido de Iracema")); });
    expect(screen.getByText("Cancelar pedido?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Sim, cancelar")); });
    expect(cancelRequest).toHaveBeenCalledWith("r3");
  });

  it("avisa quando o cancelamento falha (Spec 101)", async () => {
    setup({ items });
    cancelRequest.mockResolvedValueOnce(false);
    const screen = await renderView();
    await act(async () => { fireEvent.press(screen.getByLabelText("Cancelar pedido de Iracema")); });
    await act(async () => { fireEvent.press(screen.getByText("Sim, cancelar")); });
    expect(screen.getByText("Não foi possível cancelar o pedido. Tente novamente.")).toBeDefined();
  });

  it("renderiza botão Voltar no cabeçalho mobile quando onBack é informado", async () => {
    setup({ items });
    const onBack = jest.fn();
    const screen = await renderView({ onBack });
    const backBtn = screen.getByLabelText("Voltar");
    expect(backBtn).toBeDefined();
    await act(async () => { fireEvent.press(backBtn); });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("aciona reload ao tentar novamente no estado de erro online e offline", async () => {
    const { reload } = setup({ error: "Falha ao carregar." });
    const onlineScreen = await renderView();
    await act(async () => { fireEvent.press(onlineScreen.getByLabelText("Tentar novamente")); });
    expect(reload).toHaveBeenCalledTimes(1);

    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    try {
      const offlineScreen = await renderView();
      await act(async () => { fireEvent.press(offlineScreen.getByLabelText("Tentar novamente")); });
      expect(reload).toHaveBeenCalledTimes(2);
    } finally {
      jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    }
  });

  it("alterna filtros Ativas/Concluídas e aciona Ver concluídas quando só há entregas finalizadas", async () => {
    const completedOnly: ConversationItem[] = [
      {
        requestId: "r4",
        listing: listing("b4", "Memórias Póstumas", "delivered"),
        otherName: "Carlos",
        otherPhotoUrl: null,
        preview: "Entrega confirmada",
        lastMessageAt: null,
        kind: "accepted",
      },
    ];
    setup({ items: completedOnly });
    const screen = await renderView();

    expect(screen.getByText("Nenhuma conversa ativa no momento")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Ver concluídas")); });
    expect(screen.getByText("Carlos")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByText("Ativas (0)")); });
    expect(screen.getByText("Nenhuma conversa ativa no momento")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByText("Concluídas (1)")); });
    expect(screen.getByText("Carlos")).toBeDefined();
  });

  it("permite manter conversa ou pedido ao cancelar os diálogos de confirmação", async () => {
    setup({ items });
    deleteConversation.mockClear();
    cancelRequest.mockClear();
    const screen = await renderView();

    await act(async () => { fireEvent(screen.getByText("Ana Paula"), "longPress"); });
    expect(screen.getByText("Apagar conversa?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Manter")); });
    expect(screen.queryByText("Apagar conversa?")).toBeNull();
    expect(deleteConversation).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(screen.getByLabelText("Cancelar pedido de Iracema")); });
    expect(screen.getByText("Cancelar pedido?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Manter pedido")); });
    expect(screen.queryByText("Cancelar pedido?")).toBeNull();
    expect(cancelRequest).not.toHaveBeenCalled();
  });

  it("ConversationsScreen exige login quando não autenticado e renderiza quando há sessão", async () => {
    setup({ items });
    const onRequireSignIn = jest.fn();
    const authActions = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      requestPasswordReset: jest.fn(),
    };
    const spy = jest.spyOn(container, "makeAuthViewModel");
    try {
      spy.mockReturnValue([{ user: null, loading: false, error: null }, authActions]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ConversationsScreen onRequireSignIn={onRequireSignIn} />);
      });
      expect(onRequireSignIn).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Ana Paula")).toBeNull();

      spy.mockReturnValue([
        { user: { id: "me", email: "me@example.com", name: "Eu" }, loading: false, error: null },
        authActions,
      ]);
      await act(async () => {
        screen.rerender(<ConversationsScreen onRequireSignIn={onRequireSignIn} />);
      });
      expect(screen.getByText("Ana Paula")).toBeDefined();
    } finally {
      spy.mockRestore();
    }
  });
});
