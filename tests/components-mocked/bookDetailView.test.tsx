import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { RequestNegotiationState } from "@/viewmodel/useRequestNegotiationViewModel";
import type { ShareListingState } from "@/viewmodel/useShareListingViewModel";
import BookDetail from "@/view/listings/bookDetail";

vi.mock("@/viewmodel/useBookDetailViewModel", () => ({ useBookDetailViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useRequestNegotiationViewModel", () => ({ useRequestNegotiationViewModel: vi.fn() }));
vi.mock("@/viewmodel/useShareListingViewModel", () => ({ useShareListingViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";

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

const emptyShare: ShareListingState = {
  sharing: false,
  linkCopied: false,
  error: null,
};

function setup(
  book: Book | null,
  user: AuthState["user"],
  options: {
    loading?: boolean;
    error?: string | null;
    negotiation?: Partial<RequestNegotiationState>;
    share?: Partial<ShareListingState>;
  } = {},
) {
  vi.mocked(useBookDetailViewModel).mockReturnValue([
    { book, loading: options.loading ?? false, error: options.error ?? null, isFavorite: false, favoriteError: null, favoriteLoading: false },
    { reload: vi.fn(), toggleFavorite: vi.fn() },
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
  const share = vi.fn().mockResolvedValue(undefined);
  const shareToWhatsApp = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useShareListingViewModel).mockReturnValue([
    { ...emptyShare, ...options.share },
    { share, shareToWhatsApp, dismissLinkCopied: vi.fn() },
  ]);
  return { request, share, shareToWhatsApp };
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
    const { request } = setup(book({ ownerId: "other" }), user);
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

  it("oferece ver fotos em tela cheia quando há foto de capa (Spec 018)", async () => {
    setup(book({ photoUrl: "capa.jpg" }), user);
    const screen = await renderDetail();
    const trigger = screen.getByLabelText("Ver fotos do anúncio em tela cheia");
    await act(async () => { fireEvent.press(trigger); });
    expect(screen.getByLabelText("Fechar galeria de fotos")).toBeDefined();
  });

  it("não oferece ver fotos quando o anúncio só tem capa ilustrativa (Spec 018)", async () => {
    setup(book({ photoUrl: undefined, photos: undefined }), user);
    const screen = await renderDetail();
    expect(screen.queryByLabelText("Ver fotos do anúncio em tela cheia")).toBeNull();
  });

  it("aciona onNavigateToReport ao tocar em denunciar anúncio", async () => {
    setup(book({ ownerId: "other" }), user);
    const onNavigateToReport = vi.fn();
    const screen = await renderDetail({ onNavigateToReport });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar anúncio")); });
    expect(onNavigateToReport).toHaveBeenCalledWith("b1");
  });

  it("aciona onBack ao tocar no botão voltar da barra superior (FR-011)", async () => {
    setup(book({}), user);
    const onBack = vi.fn();
    const screen = await renderDetail({ onBack });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("oferece compartilhar mesmo sem sessão (Spec 019)", async () => {
    const { share } = setup(book({ ownerId: "other" }), null);
    const screen = await renderDetail();
    await act(async () => { fireEvent.press(screen.getByLabelText("Compartilhar anúncio")); });
    expect(share).toHaveBeenCalledWith("b1");
  });

  it("compartilha no WhatsApp com os dados do anúncio (Issue #145)", async () => {
    const { shareToWhatsApp } = setup(
      book({ ownerId: "other", modality: "sale", price: 42 }),
      null,
    );
    const screen = await renderDetail();
    await act(async () => { fireEvent.press(screen.getByLabelText("Compartilhar no WhatsApp")); });
    expect(shareToWhatsApp).toHaveBeenCalledWith("b1", {
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "sale",
      price: 42,
    });
  });

  it("mostra confirmação de link copiado (Spec 019)", async () => {
    setup(book({}), user, { share: { linkCopied: true } });
    const screen = await renderDetail();
    expect(screen.getByText("Link copiado")).toBeDefined();
  });

  it("mostra erro ao compartilhar (Spec 019)", async () => {
    setup(book({}), user, { share: { error: "Não foi possível compartilhar o anúncio. Tente novamente." } });
    const screen = await renderDetail();
    expect(screen.getByText("Não foi possível compartilhar o anúncio. Tente novamente.")).toBeDefined();
  });
});
