import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { RequestNegotiationState } from "@/viewmodel/useRequestNegotiationViewModel";
import BookDetail from "@/view/listings/bookDetail";

vi.mock("@/viewmodel/useBookDetailViewModel", () => ({ useBookDetailViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useRequestNegotiationViewModel", () => ({ useRequestNegotiationViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
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

function setup(
  book: Book | null,
  user: AuthState["user"],
  options: { loading?: boolean; error?: string | null; negotiation?: Partial<RequestNegotiationState> } = {},
) {
  vi.mocked(useBookDetailViewModel).mockReturnValue([
    { book, loading: options.loading ?? false, error: options.error ?? null },
    { reload: vi.fn() },
  ]);
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
  ]);
  const request = vi.fn().mockResolvedValue(true);
  vi.mocked(useRequestNegotiationViewModel).mockReturnValue([
    { ...emptyNegotiation, ...options.negotiation },
    { request },
  ]);
  return request;
}

async function renderDetail(props: Partial<React.ComponentProps<typeof BookDetail>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<BookDetail bookId="b1" onBack={() => {}} {...props} />);
  });
  return screen;
}

describe("BookDetail (spec 006, US6/T029)", () => {
  const user = { id: "me", email: "eu@exemplo.com" };

  it("mostra título, autor, modalidade e preço (venda)", async () => {
    setup(book({ modality: "sale", price: 42 }), user);
    const screen = await renderDetail();
    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("Dom Casmurro");
    expect(screen.getAllByText("Machado de Assis").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Venda")).toBeDefined();
    expect(screen.getByText("R$ 42.00")).toBeDefined();
  });

  it("não mostra preço fora da modalidade venda", async () => {
    setup(book({ modality: "donation" }), user);
    const screen = await renderDetail();
    expect(screen.queryByText(/R\$/)).toBeNull();
  });

  it("mostra erro de domínio quando o livro não é encontrado (FR-009)", async () => {
    setup(null, user, { error: "Anúncio não encontrado." });
    const screen = await renderDetail();
    expect(screen.getByRole("alert").props.children).toBe("Anúncio não encontrado.");
  });

  it("oferece solicitar negociação para outra pessoa autenticada", async () => {
    const request = setup(book({ ownerId: "other" }), user);
    const screen = await renderDetail();
    await act(async () => { fireEvent.press(screen.getByText("Solicitar negociação")); });
    expect(request).toHaveBeenCalledWith("b1", "me");
  });

  it("não oferece solicitar negociação no próprio anúncio", async () => {
    setup(book({ ownerId: "me" }), user);
    const screen = await renderDetail();
    expect(screen.queryByText("Solicitar negociação")).toBeNull();
  });

  it("não oferece solicitar negociação sem sessão", async () => {
    setup(book({ ownerId: "other" }), null);
    const screen = await renderDetail();
    expect(screen.queryByText("Solicitar negociação")).toBeNull();
  });

  it("mostra confirmação quando já solicitada e indica anúncio reservado", async () => {
    setup(book({ id: "b1", ownerId: "other", status: "available" }), user, {
      negotiation: { requestedListingIds: ["b1"] },
    });
    const screen = await renderDetail();
    expect(screen.getByText("Negociação solicitada")).toBeDefined();

    setup(book({ id: "b1", ownerId: "other", status: "reserved" }), user);
    const reservedScreen = await renderDetail();
    expect(reservedScreen.getByText("Reservado")).toBeDefined();
  });

  it("aciona onNavigateToUserProfile ao tocar no nome de quem anunciou (US5)", async () => {
    setup(book({ ownerId: "owner-xyz" }), user);
    const onNavigateToUserProfile = vi.fn();
    const screen = await renderDetail({ onNavigateToUserProfile });
    await act(async () => { fireEvent.press(screen.getByText("Anunciado por owner-xyz")); });
    expect(onNavigateToUserProfile).toHaveBeenCalledWith("owner-xyz");
  });

  it("aciona onBack ao tocar no botão voltar da barra superior (FR-011)", async () => {
    setup(book({}), user);
    const onBack = vi.fn();
    const screen = await renderDetail({ onBack });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
