import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { ReceivedRequestsActions, ReceivedRequestsState } from "@/viewmodel/useReceivedRequestsViewModel";
import { ReceivedRequests } from "@/view/requests/receivedRequests";

jest.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({ useReceivedRequestsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: jest.fn() }));

import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

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
  const full: ReceivedRequestsActions = { reload: jest.fn(), accept: jest.fn(), reject: jest.fn(), ...actions };
  jest.mocked(useReceivedRequestsViewModel).mockReturnValue([{ ...base, ...state }, full]);
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
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockReceived({ error: "Pedidos indisponíveis." });
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });

  it("mostra estado vazio", async () => {
    mockReceived({});
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    expect(screen.getByText("Você ainda não recebeu pedidos para os seus anúncios.")).toBeDefined();
  });

  it("aceita e recusa pedido pendente; não oferece ações para respondidos", async () => {
    const actions = mockReceived(
      {
        items: [
          { request: { id: "r1", listingId: "l1", requesterId: "alice", status: "pending" }, listing, requesterName: "Alice Souza" },
          { request: { id: "r2", listingId: "l1", requesterId: "bob", status: "rejected" }, listing },
        ],
      },
      { accept: jest.fn().mockResolvedValue(true) },
    );
    const screen = await renderEl(<ReceivedRequests sessionUserId="owner" />);
    // Spec 043 RN-02: nome público; sem perfil, nunca o identificador interno.
    expect(screen.getByText("Pessoa interessada: Alice Souza")).toBeDefined();
    expect(screen.getByText("Pessoa interessada: Pessoa da comunidade")).toBeDefined();
    expect(screen.queryByText(/Pessoa interessada: (alice|bob)$/)).toBeNull();
    expect(screen.getByText("Recusado")).toBeDefined();
    expect(screen.getAllByText("Aceitar")).toHaveLength(1);
    await act(async () => { fireEvent.press(screen.getByText("Aceitar")); });
    expect(actions.accept).not.toHaveBeenCalled();
    expect(screen.getByText("Aceitar este pedido?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Aceitar pedido")); });
    expect(actions.accept).toHaveBeenCalledWith("r1");
    await act(async () => { fireEvent.press(screen.getByText("Recusar")); });
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
