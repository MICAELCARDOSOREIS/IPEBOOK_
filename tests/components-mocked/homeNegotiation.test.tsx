import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { RequestNegotiationState } from "@/viewmodel/useRequestNegotiationViewModel";
import Home from "@/view/home";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useRequestNegotiationViewModel", () => ({ useRequestNegotiationViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Livro",
  author: "Autora",
  ownerId: "other",
  modality: "trade",
  status: "available",
  ...over,
});

const emptyNegotiation: RequestNegotiationState = {
  pendingListingId: null,
  requestedListingIds: [],
  error: null,
  errorListingId: null,
};

function setup(books: Book[], user: AuthState["user"], negotiation: Partial<RequestNegotiationState> = {}) {
  vi.mocked(useHomeViewModel).mockReturnValue([{ books, loading: false, error: null }, { reload: vi.fn() }]);
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn() },
  ]);
  const request = vi.fn().mockResolvedValue(true);
  vi.mocked(useRequestNegotiationViewModel).mockReturnValue([{ ...emptyNegotiation, ...negotiation }, { request }]);
  return request;
}

async function renderHome(props: React.ComponentProps<typeof Home> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => { screen = await render(<Home {...props} />); });
  return screen;
}

describe("negociação na Home (ISO/IEC 25010 - Usabilidade)", () => {
  const user = { id: "me", email: "eu@exemplo.com" };

  it("oferece solicitar só em anúncio disponível de outra pessoa", async () => {
    const request = setup(
      [book({ id: "a", title: "De outra" }), book({ id: "b", title: "Meu", ownerId: "me" }), book({ id: "c", title: "Livro Reservado", status: "reserved" })],
      user,
    );
    const screen = await renderHome();
    expect(screen.getAllByText("Solicitar negociação")).toHaveLength(1);
    expect(screen.getByText("Reservado", { exact: true })).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Solicitar negociação de De outra")); });
    expect(request).toHaveBeenCalledWith("a", "me");
  });

  it("não oferece solicitar sem sessão", async () => {
    setup([book({})], null);
    const screen = await renderHome();
    expect(screen.queryByText("Solicitar negociação")).toBeNull();
    expect(screen.queryByText("Pedidos recebidos")).toBeNull();
  });

  it("mostra confirmação e erro por anúncio", async () => {
    setup([book({ id: "a" }), book({ id: "b" })], user, {
      requestedListingIds: ["a"],
      error: "Você já tem um pedido pendente para este anúncio.",
      errorListingId: "b",
    });
    const screen = await renderHome();
    expect(screen.getByText("Negociação solicitada")).toBeDefined();
    expect(screen.getByText("Você já tem um pedido pendente para este anúncio.")).toBeDefined();
  });

  it("navega para pedidos recebidos e meus pedidos", async () => {
    setup([], user);
    const onNavigateToReceivedRequests = vi.fn();
    const onNavigateToSentRequests = vi.fn();
    const screen = await renderHome({ onNavigateToReceivedRequests, onNavigateToSentRequests });
    await act(async () => { fireEvent.press(screen.getByText("Pedidos recebidos")); });
    await act(async () => { fireEvent.press(screen.getByText("Meus pedidos")); });
    expect(onNavigateToReceivedRequests).toHaveBeenCalledTimes(1);
    expect(onNavigateToSentRequests).toHaveBeenCalledTimes(1);
  });
});
