import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { ReceivedRequestsActions, ReceivedRequestsState } from "@/viewmodel/useReceivedRequestsViewModel";
import type { RequestListState } from "@/viewmodel/useSentRequestsViewModel";
import { ReceivedRequests } from "@/view/requests/receivedRequests";
import { SentRequests } from "@/view/requests/sentRequests";

vi.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({ useReceivedRequestsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useSentRequestsViewModel", () => ({ useSentRequestsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

const listing: Book = {
  id: "l1",
  title: "Vidas Secas",
  author: "Graciliano Ramos",
  ownerId: "owner",
  modality: "donation",
  status: "available",
};

const base: ReceivedRequestsState = {
  items: [],
  loading: false,
  error: null,
  respondingId: null,
  respondError: null,
  respondErrorId: null,
};

function mockReceived(state: Partial<ReceivedRequestsState>, actions: Partial<ReceivedRequestsActions> = {}) {
  const full: ReceivedRequestsActions = { reload: vi.fn(), accept: vi.fn(), reject: vi.fn(), ...actions };
  vi.mocked(useReceivedRequestsViewModel).mockReturnValue([{ ...base, ...state }, full]);
  return full;
}

async function renderEl(el: React.ReactElement) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => { screen = await render(el); });
  return screen;
}

describe("tela de pedidos recebidos (ISO/IEC 25010 - Usabilidade)", () => {
  it("mostra carregamento", async () => {
    mockReceived({ loading: true });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Carregando pedidos…")).toBeDefined();
  });

  it("mostra erro com opção de tentar novamente", async () => {
    const actions = mockReceived({ error: "Pedidos indisponíveis." });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Pedidos indisponíveis.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Tentar novamente")); });
    expect(actions.reload).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline (Issue #76)", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockReceived({ error: "Pedidos indisponíveis." });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });

  it("mostra estado vazio", async () => {
    mockReceived({});
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Você ainda não recebeu pedidos para os seus anúncios.")).toBeDefined();
  });

  it("aceita e recusa pedido pendente; não oferece ações para respondidos", async () => {
    const actions = mockReceived({
      items: [
        { request: { id: "r1", listingId: "l1", requesterId: "alice", status: "pending" }, listing },
        { request: { id: "r2", listingId: "l1", requesterId: "bob", status: "rejected" }, listing },
      ],
    });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Pessoa interessada: alice")).toBeDefined();
    expect(screen.getByText("Recusado")).toBeDefined();
    expect(screen.getAllByText("Aceitar")).toHaveLength(1);
    await act(async () => { fireEvent.press(screen.getByText("Aceitar")); });
    await act(async () => { fireEvent.press(screen.getByText("Recusar")); });
    expect(actions.accept).toHaveBeenCalledWith("r1");
    expect(actions.reject).toHaveBeenCalledWith("r1");
  });

  it("mostra o erro de resposta no pedido correspondente", async () => {
    mockReceived({
      items: [{ request: { id: "r1", listingId: "l1", requesterId: "alice", status: "pending" }, listing }],
      respondError: "Este pedido já foi respondido.",
      respondErrorId: "r1",
    });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Este pedido já foi respondido.")).toBeDefined();
  });
});

describe("tela de meus pedidos (ISO/IEC 25010 - Usabilidade)", () => {
  it("mostra status de cada pedido enviado e o estado vazio", async () => {
    const state: RequestListState = {
      items: [{ request: { id: "r1", listingId: "l1", requesterId: "alice", status: "accepted" }, listing }],
      loading: false,
      error: null,
    };
    vi.mocked(useSentRequestsViewModel).mockReturnValue([state, { reload: vi.fn() }]);
    const onBack = vi.fn();
    const screen = await renderEl(<SentRequests sessionUserId="alice" onBack={onBack} />);
    expect(screen.getByText("Vidas Secas")).toBeDefined();
    expect(screen.getByText("Aceito")).toBeDefined();
    expect(screen.queryByText("Aceitar")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByText("Voltar")); });
    expect(onBack).toHaveBeenCalledTimes(1);

    vi.mocked(useSentRequestsViewModel).mockReturnValue([{ ...state, items: [] }, { reload: vi.fn() }]);
    const empty = await renderEl(<SentRequests sessionUserId="alice" />);
    expect(empty.getByText("Você ainda não solicitou nenhuma negociação.")).toBeDefined();
  });
});
