import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import BookDetail from "@/view/listings/bookDetail";
import { ReservedListingSheet } from "@/view/listings/ReservedListingSheet";

jest.mock("@/viewmodel/useBookDetailViewModel", () => ({ useBookDetailViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useRequestNegotiationViewModel", () => ({ useRequestNegotiationViewModel: jest.fn() }));
jest.mock("@/viewmodel/useShareListingViewModel", () => ({ useShareListingViewModel: jest.fn(), SHARE_BASE_URL: "https://ipebook.app" }));
jest.mock("react-native-view-shot", () => ({ captureRef: jest.fn().mockResolvedValue("file:///tmp/anuncio.png") }));
jest.mock("@/viewmodel/usePublicProfileViewModel", () => ({ usePublicProfileViewModel: jest.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";

const sampleBook = (over: Partial<Book> = {}): Book => ({
  id: "b1",
  title: "1984",
  author: "George Orwell",
  ownerId: "owner-1",
  modality: "sale",
  price: 15,
  status: "reserved",
  category: "Ficção",
  ...over,
});

function setupDetail(
  book: Book,
  user: AuthState["user"],
  options: {
    requestedListingIds?: string[];
    isFavorite?: boolean;
    toggleFavoriteMock?: () => Promise<void>;
  } = {},
) {
  jest.mocked(useAuthViewModel).mockReturnValue([{ user, loading: false } as AuthState, { signOut: jest.fn() } as never]);
  const toggleFavorite = options.toggleFavoriteMock ?? jest.fn().mockResolvedValue(undefined);
  jest.mocked(useBookDetailViewModel).mockReturnValue([
    {
      book,
      loading: false,
      error: null,
      isFavorite: options.isFavorite ?? false,
      favoriteError: null,
      favoriteLoading: false,
    },
    { reload: jest.fn(), toggleFavorite },
  ]);
  jest.mocked(useRequestNegotiationViewModel).mockReturnValue([
    {
      pendingListingId: null,
      requestedListingIds: options.requestedListingIds ?? [],
      error: null,
      errorListingId: null,
      activeRequestId: null,
      activeRequestStatus: null,
      loadingActiveRequest: false,
    },
    { request: jest.fn(), checkActiveRequest: jest.fn().mockResolvedValue(null) },
  ]);
  jest.mocked(useShareListingViewModel).mockReturnValue([
    { sharing: false, linkCopied: false, error: null },
    { share: jest.fn(), shareImage: jest.fn(), shareToWhatsApp: jest.fn(), dismissLinkCopied: jest.fn(), dismissError: jest.fn() },
  ]);
  jest.mocked(usePublicProfileViewModel).mockReturnValue([
    {
      profile: {
        userId: book.ownerId,
        name: "Maria Santos",
        joinedAt: "2026-01-01",
        averageRating: 4.8,
        ratingCount: 5,
        completedNegotiations: 5,
      },
      loading: false,
      error: null,
    },
    { reload: jest.fn() },
  ]);
}

async function renderComponent(element: React.ReactElement) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(element);
  });
  return screen;
}

describe("Spec 110 — Ações Interativas de Reserva no Detalhe do Livro", () => {
  it("permite virar o livro no detalhe e ler a sinopse integral", async () => {
    const synopsis = "Uma sinopse longa para leitura integral. ".repeat(30).trim();
    setupDetail(sampleBook({ synopsis }), null);
    const screen = await renderComponent(<BookDetail bookId="b1" onBack={jest.fn()} />);

    expect(screen.getByRole("header", { name: "Sinopse" })).toBeDefined();
    expect(screen.getByText(synopsis).props.numberOfLines).toBeUndefined();
    expect(screen.queryByText("3D · Toque para virar")).toBeNull();
    const cover = screen.getByLabelText(/^Capa de 1984, em 3D/);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 550));
      await fireEvent(cover, "accessibilityAction", { nativeEvent: { actionName: "activate" } });
      await new Promise((resolve) => setTimeout(resolve, 550));
    });
    expect(screen.getByTestId("book3d-face-back")).toBeDefined();
  });

  it("renderiza a pílula de 'Reservado' como botão acessível e abre a folha informativa para terceiros", async () => {
    const book = sampleBook({ ownerId: "owner-1", status: "reserved" });
    const user = { id: "third-party", email: "third@example.com" } as AuthState["user"];
    setupDetail(book, user);

    const screen = await renderComponent(
      <BookDetail bookId="b1" onBack={jest.fn()} />,
    );

    // Encontra o botão de Reservado
    const reservedButton = screen.getByLabelText("Livro reservado. Toque para saber mais e entrar na lista de espera");
    expect(reservedButton).toBeDefined();

    // Ao tocar, abre a folha informativa
    await act(async () => {
      fireEvent.press(reservedButton);
    });

    expect(screen.getByText("Exemplar Reservado")).toBeDefined();
    expect(screen.getByText(/Se o encontro não for concluído em até 7 dias/)).toBeDefined();
    expect(screen.getByText("Outros livros de Ficção")).toBeDefined();
  });

  it("direciona o dono do anúncio para gerenciar anúncio ao tocar em 'Reservado'", async () => {
    const book = sampleBook({ ownerId: "me", status: "reserved" });
    const user = { id: "me", email: "me@example.com" } as AuthState["user"];
    setupDetail(book, user);

    const onNavigateToManageListing = jest.fn();
    const screen = await renderComponent(
      <BookDetail
        bookId="b1"
        onBack={jest.fn()}
        onNavigateToManageListing={onNavigateToManageListing}
      />,
    );

    const ownerButton = screen.getByLabelText("Livro reservado. Toque para gerenciar anúncio e acompanhar");
    expect(ownerButton).toBeDefined();

    await act(async () => {
      fireEvent.press(ownerButton);
    });

    expect(onNavigateToManageListing).toHaveBeenCalledWith("b1");
  });

  it("direciona o leitor que solicitou o livro para Meus Pedidos ao tocar no botão de status", async () => {
    const book = sampleBook({ id: "b1", ownerId: "other", status: "reserved" });
    const user = { id: "buyer", email: "buyer@example.com" } as AuthState["user"];
    setupDetail(book, user, { requestedListingIds: ["b1"] });

    const onNavigateToMyRequests = jest.fn();
    const screen = await renderComponent(
      <BookDetail
        bookId="b1"
        onBack={jest.fn()}
        onNavigateToMyRequests={onNavigateToMyRequests}
      />,
    );

    const requesterButton = screen.getByLabelText("Livro reservado para você. Toque para ver seus pedidos");
    expect(requesterButton).toBeDefined();

    await act(async () => {
      fireEvent.press(requesterButton);
    });

    expect(onNavigateToMyRequests).toHaveBeenCalled();
  });

  it("folha ReservedListingSheet executa ações de favoritar, busca na categoria e perfil", async () => {
    const onToggleFavorite = jest.fn();
    const onSearchCategory = jest.fn();
    const onViewOwnerProfile = jest.fn();
    const onClose = jest.fn();

    const screen = await renderComponent(
      <ReservedListingSheet
        visible={true}
        onClose={onClose}
        status="reserved"
        category="Ficção Científica"
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        onSearchCategory={onSearchCategory}
        onViewOwnerProfile={onViewOwnerProfile}
        ownerName="Carlos Silva"
      />,
    );

    // 1. Favoritar
    const favoriteBtn = screen.getByLabelText("Favoritar para ser avisado se a reserva for cancelada");
    await act(async () => {
      fireEvent.press(favoriteBtn);
    });
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);

    // 2. Busca na categoria
    const categoryBtn = screen.getByLabelText("Buscar outros livros da categoria Ficção Científica");
    await act(async () => {
      fireEvent.press(categoryBtn);
    });
    expect(onSearchCategory).toHaveBeenCalledWith("Ficção Científica");
    expect(onClose).toHaveBeenCalled();

    // 3. Perfil do anunciante
    const profileBtn = screen.getByLabelText("Ver perfil e outros anúncios de Carlos Silva");
    await act(async () => {
      fireEvent.press(profileBtn);
    });
    expect(onViewOwnerProfile).toHaveBeenCalledTimes(1);

    // 4. Fechar / Entendi
    const dismissBtn = screen.getByText("Entendi");
    await act(async () => {
      fireEvent.press(dismissBtn);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("aplica as cores da modalidade de venda ao botão 'Reservado'", async () => {
    const book = sampleBook({ ownerId: "owner-1", status: "reserved", modality: "sale" });
    const user = { id: "third-party", email: "third@example.com" } as AuthState["user"];
    setupDetail(book, user);

    const screen = await renderComponent(
      <BookDetail bookId="b1" onBack={jest.fn()} />,
    );

    const reservedButton = screen.getByLabelText("Livro reservado. Toque para saber mais e entrar na lista de espera");
    expect(reservedButton).toBeDefined();
    const reservedText = screen.getByText("Reservado");
    expect(reservedText).toBeDefined();
    const flattenedStyle = Object.assign({}, ...[].concat(reservedButton.props.style as any));
    expect(flattenedStyle.backgroundColor).toBe("#EBF4EC");
  });

  it("aplica cores de modalidade para troca e doação e cobre botões de solicitação aceita", async () => {
    // 1. Troca
    const bookTrade = sampleBook({ ownerId: "owner-1", status: "reserved", modality: "trade" });
    const user = { id: "user-2", email: "user2@example.com" } as AuthState["user"];
    setupDetail(bookTrade, user);
    let screen = await renderComponent(<BookDetail bookId="b1" onBack={jest.fn()} />);
    let btn = screen.getByLabelText("Livro reservado. Toque para saber mais e entrar na lista de espera");
    let style = Object.assign({}, ...[].concat(btn.props.style as any));
    expect(style.backgroundColor).toBe("#F4EAE4");

    // 2. Doação
    const bookDonation = sampleBook({ ownerId: "owner-1", status: "reserved", modality: "donation" });
    setupDetail(bookDonation, user);
    screen = await renderComponent(<BookDetail bookId="b1" onBack={jest.fn()} />);
    btn = screen.getByLabelText("Livro reservado. Toque para saber mais e entrar na lista de espera");
    style = Object.assign({}, ...[].concat(btn.props.style as any));
    expect(style.backgroundColor).toBe("#FEF3C7");

    // 3. Negociação solicitada e aceita
    const bookAccepted = sampleBook({ ownerId: "owner-1", status: "available", modality: "donation" });
    setupDetail(bookAccepted, user, { requestedListingIds: ["b1"] });
    jest.mocked(useRequestNegotiationViewModel).mockReturnValue([
      { sentRequests: [{ id: "req-1", listingId: "b1", status: "accepted" }], requestedListingIds: ["b1"], activeRequestStatus: "accepted", activeRequestId: "req-1" } as any,
      { checkActiveRequest: jest.fn() } as any,
    ]);
    screen = await renderComponent(<BookDetail bookId="b1" onBack={jest.fn()} onNavigateToMyRequests={jest.fn()} />);
    const acceptedBtn = screen.getByText("Combinar encontro");
    expect(acceptedBtn).toBeDefined();

    // 4. Negociação solicitada pendente
    jest.mocked(useRequestNegotiationViewModel).mockReturnValue([
      { sentRequests: [{ id: "req-2", listingId: "b1", status: "pending" }], requestedListingIds: ["b1"], activeRequestStatus: "pending", activeRequestId: "req-2" } as any,
      { checkActiveRequest: jest.fn() } as any,
    ]);
    screen = await renderComponent(<BookDetail bookId="b1" onBack={jest.fn()} onNavigateToMyRequests={jest.fn()} />);
    const pendingBtn = screen.getByText("Negociação solicitada");
    expect(pendingBtn).toBeDefined();
  });
});
