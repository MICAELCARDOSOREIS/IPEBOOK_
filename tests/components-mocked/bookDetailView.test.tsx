import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { RequestNegotiationState } from "@/viewmodel/useRequestNegotiationViewModel";
import type { ShareListingState } from "@/viewmodel/useShareListingViewModel";
import BookDetail from "@/view/listings/bookDetail";

jest.mock("@/viewmodel/useBookDetailViewModel", () => ({ useBookDetailViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useRequestNegotiationViewModel", () => ({ useRequestNegotiationViewModel: jest.fn() }));
jest.mock("@/viewmodel/useShareListingViewModel", () => ({ useShareListingViewModel: jest.fn(), SHARE_BASE_URL: "https://ipebook.app" }));
jest.mock("react-native-view-shot", () => ({ captureRef: jest.fn().mockResolvedValue("file:///tmp/anuncio.png") }));
jest.mock("@/viewmodel/usePublicProfileViewModel", () => ({ usePublicProfileViewModel: jest.fn() }));
jest.mock("@/viewmodel/useMyListingsViewModel", () => ({
  useMyListingsViewModel: jest.fn().mockReturnValue([{ books: [], loading: false, error: null }, { reload: jest.fn() }]),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
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
  activeRequestId: null,
  activeRequestStatus: null,
  loadingActiveRequest: false,
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
    /** Nome público de quem anunciou; ausente simula perfil ainda carregando ou indisponível. */
    ownerName?: string;
  } = {},
) {
  jest.mocked(usePublicProfileViewModel).mockReturnValue([
    {
      profile: options.ownerName
        ? {
          userId: book?.ownerId ?? "other",
          name: options.ownerName,
          joinedAt: "2026-01-01",
          averageRating: null,
          ratingCount: 0,
          completedNegotiations: 0,
        }
        : null,
      loading: false,
      error: null,
    },
    { reload: jest.fn() },
  ]);
  const reload = jest.fn();
  const toggleFavorite = jest.fn();
  jest.mocked(useBookDetailViewModel).mockReturnValue([
    { book, loading: options.loading ?? false, error: options.error ?? null, isFavorite: false, favoriteError: null, favoriteLoading: false },
    { reload, toggleFavorite },
  ]);
  jest.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() },
  ]);
  const request = jest.fn().mockResolvedValue(true);
  jest.mocked(useRequestNegotiationViewModel).mockReturnValue([
    { ...emptyNegotiation, ...options.negotiation },
    { request, checkActiveRequest: jest.fn().mockResolvedValue(null) },
  ]);
  const share = jest.fn().mockResolvedValue(undefined);
  const shareToWhatsApp = jest.fn().mockResolvedValue(undefined);
  const shareImage = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useShareListingViewModel).mockReturnValue([
    { ...emptyShare, ...options.share },
    { share, shareImage, shareToWhatsApp, dismissLinkCopied: jest.fn(), dismissError: jest.fn() },
  ]);
  return { request, share, shareToWhatsApp, shareImage, reload, toggleFavorite };
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
    expect(screen.getByText(/R\$\s*42/)).toBeDefined();
  });

  it("não mostra preço fora da modalidade venda", async () => {
    setup(book({ modality: "donation" }), user);
    const screen = await renderDetail();
    expect(screen.queryByText(/R\$/)).toBeNull();
  });

  it("mostra erro de domínio quando o livro não é encontrado e permite tentar novamente (FR-009, Spec 125)", async () => {
    const { reload } = setup(null, user, { error: "Anúncio não encontrado." });
    const screen = await renderDetail();
    expect(screen.getByRole("alert").props.children).toBe("Anúncio não encontrado.");
    const retryButton = screen.getByRole("button", { name: "Tentar novamente" });
    await act(async () => { fireEvent.press(retryButton); });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["sale", "Tenho interesse"],
    ["trade", "Propor troca"],
    ["donation", "Quero receber"],
  ] as const)("ação principal de %s é \"%s\" e solicita a negociação (Spec 074, CA1)", async (modality, label) => {
    const { request } = setup(book({ ownerId: "other", modality, price: modality === "sale" ? 25 : undefined }), user);
    const screen = await renderDetail();
    await act(async () => { fireEvent.press(screen.getByText(label)); });
    const confirmLabel = modality === "trade" ? "Enviar proposta de troca" : "Confirmar interesse";
    await act(async () => { fireEvent.press(screen.getByText(confirmLabel)); });
    expect(request).toHaveBeenCalledWith("b1", "me", expect.anything());
  });

  it("não oferece ação principal no próprio anúncio, mas mantém compartilhar na barra superior (Spec 074, CA2)", async () => {
    setup(book({ ownerId: "me" }), user);
    const screen = await renderDetail();
    expect(screen.queryByText("Propor troca")).toBeNull();
    expect(screen.getByLabelText("Compartilhar anúncio")).toBeDefined();
  });

  it("não oferece ação principal sem sessão (Spec 074, CA2)", async () => {
    setup(book({ ownerId: "other" }), null);
    const screen = await renderDetail();
    expect(screen.queryByText("Propor troca")).toBeNull();
  });

  it("mostra valor e etiqueta por modalidade (Spec 074, CA3)", async () => {
    setup(book({ modality: "trade" }), user);
    const trade = await renderDetail();
    expect(trade.getByText("Por outro livro")).toBeDefined();
    expect(trade.getByText("Troca")).toBeDefined();

    setup(book({ modality: "donation" }), user);
    const donation = await renderDetail();
    expect(donation.getByText("Gratuito")).toBeDefined();
    expect(donation.getByText("Doação")).toBeDefined();
  });

  it("mostra o cartão da modalidade só em troca e doação (Spec 074, CA4)", async () => {
    setup(book({ modality: "trade" }), user);
    const trade = await renderDetail();
    expect(trade.getByText("Aceita em troca")).toBeDefined();
    expect(trade.queryByText("Doação para quem vai ler")).toBeNull();

    setup(book({ modality: "donation" }), user);
    const donation = await renderDetail();
    expect(donation.getByText("Doação para quem vai ler")).toBeDefined();

    setup(book({ modality: "sale", price: 10 }), user);
    const sale = await renderDetail();
    expect(sale.queryByText("Aceita em troca")).toBeNull();
    expect(sale.queryByText("Doação para quem vai ler")).toBeNull();
  });

  it("lista conservação, categoria e retirada (Spec 074, CA5)", async () => {
    setup(book({ condition: "good", category: "Romance", neighborhood: "Campus IFPI Piripiri" }), user);
    const screen = await renderDetail();
    expect(screen.getByText("Conservação")).toBeDefined();
    expect(screen.getByText("Bom estado")).toBeDefined();
    expect(screen.getByText("Categoria")).toBeDefined();
    expect(screen.getByText("Romance")).toBeDefined();
    expect(screen.getByText("Retirada")).toBeDefined();
    expect(screen.getByText("Campus IFPI Piripiri")).toBeDefined();
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
    setup(book({ ownerId: "owner-xyz" }), user, { ownerName: "Joana Lima" });
    const onNavigateToUserProfile = jest.fn();
    const screen = await renderDetail({ onNavigateToUserProfile });
    await act(async () => { fireEvent.press(screen.getByLabelText("Anunciado por Joana Lima")); });
    expect(onNavigateToUserProfile).toHaveBeenCalledWith("owner-xyz");
  });

  it("nunca expõe o identificador interno de quem anunciou na tela", async () => {
    const ownerId = "665e6478-544a-4ede-9dbb-185e3435430a";
    setup(book({ ownerId }), user, { ownerName: "Joana Lima" });
    const screen = await renderDetail();
    expect(screen.queryByText(new RegExp(ownerId))).toBeNull();
    expect(screen.getByLabelText("Anunciado por Joana Lima")).toBeDefined();
    expect(screen.getByText("Joana Lima")).toBeDefined();
  });

  it("usa rótulo genérico quando o perfil de quem anunciou não está disponível", async () => {
    const ownerId = "665e6478-544a-4ede-9dbb-185e3435430a";
    setup(book({ ownerId }), user);
    const screen = await renderDetail();
    expect(screen.queryByText(new RegExp(ownerId))).toBeNull();
    expect(screen.getByLabelText("Anunciado por outro membro da comunidade")).toBeDefined();
  });

  it("oferece ver fotos em tela cheia quando há foto de capa (Spec 018)", async () => {
    setup(book({ photoUrl: "capa.jpg" }), user);
    const screen = await renderDetail();
    const trigger = screen.getByLabelText("Ver fotos do anúncio em tela cheia");
    await act(async () => { fireEvent.press(trigger); });
    expect(screen.getByLabelText("Fechar galeria de fotos")).toBeDefined();
  });

  it("mostra editora, páginas, ano e a sinopse quando vêm do ISBN (Spec 097)", async () => {
    setup(book({ synopsis: "Distopia futurista sobre vigilância.", publisher: "Companhia das Letras", pageCount: 416, publicationYear: 2009 }), user);
    const screen = await renderDetail();
    expect(screen.getByText("Editora")).toBeDefined();
    expect(screen.getByText("Companhia das Letras")).toBeDefined();
    expect(screen.getByText("416")).toBeDefined();
    expect(screen.getByText("2009")).toBeDefined();
    expect(screen.getByRole("header", { name: "Sinopse" })).toBeDefined();
    expect(screen.getByText("Distopia futurista sobre vigilância.")).toBeDefined();
  });

  it("sem dados da edição, não mostra Editora, Páginas, Ano nem Sinopse (Spec 097)", async () => {
    setup(book({}), user);
    const screen = await renderDetail();
    for (const rotulo of ["Editora", "Páginas", "Ano"]) expect(screen.queryByText(rotulo)).toBeNull();
    expect(screen.queryByRole("header", { name: "Sinopse" })).toBeNull();
  });

  it("não oferece ver fotos quando o anúncio só tem capa ilustrativa (Spec 018)", async () => {
    setup(book({ photoUrl: undefined, photos: undefined }), user);
    const screen = await renderDetail();
    expect(screen.queryByLabelText("Ver fotos do anúncio em tela cheia")).toBeNull();
  });

  it("aciona onNavigateToReport ao tocar em denunciar anúncio", async () => {
    setup(book({ ownerId: "other" }), user);
    const onNavigateToReport = jest.fn();
    const screen = await renderDetail({ onNavigateToReport });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar anúncio")); });
    expect(onNavigateToReport).toHaveBeenCalledWith("b1");
  });

  it("aciona onBack ao tocar no botão voltar da barra superior (FR-011)", async () => {
    setup(book({}), user);
    const onBack = jest.fn();
    const screen = await renderDetail({ onBack });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("oferece compartilhar com dados completos e captura de imagem mesmo sem sessão (Spec 019, Spec 092)", async () => {
    const { share } = setup(book({ ownerId: "other" }), null);
    const screen = await renderDetail();
    await act(async () => { fireEvent.press(screen.getByLabelText("Compartilhar anúncio")); });
    expect(share).toHaveBeenCalledWith(
      "b1",
      expect.objectContaining({ title: "Dom Casmurro", author: "Machado de Assis", modality: "trade" }),
      expect.any(Function),
    );
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

  it("aciona gerenciamento para dono, favoritos, galeria e folha de reservado", async () => {
    const onNavigateToManageListing = jest.fn();
    const { toggleFavorite } = setup(book({ ownerId: user.id, photoUrl: "https://cdn.ipebook.app/capa.jpg" }), user);
    const ownerScreen = await renderDetail({ onNavigateToManageListing });

    await act(async () => {
      fireEvent.press(ownerScreen.getByRole("button", { name: "Gerenciar anúncio" }));
    });
    expect(onNavigateToManageListing).toHaveBeenCalledWith("b1");

    await act(async () => {
      fireEvent.press(ownerScreen.getByRole("button", { name: "Adicionar aos favoritos" }));
    });
    expect(toggleFavorite).toHaveBeenCalledWith(user.id);

    await act(async () => {
      fireEvent.press(ownerScreen.getByRole("button", { name: "Ver fotos do anúncio em tela cheia" }));
    });
    await act(async () => {
      fireEvent.press(ownerScreen.getByRole("button", { name: "Fechar galeria de fotos" }));
    });

    const onNavigateToCategorySearch = jest.fn();
    const onNavigateToUserProfile = jest.fn();
    setup(book({ ownerId: "other", status: "reserved", category: "Ficção" }), user, { ownerName: "Carlos" });
    const reservedScreen = await renderDetail({
      onNavigateToCategorySearch,
      onNavigateToUserProfile,
    });

    await act(async () => {
      fireEvent.press(reservedScreen.getByText("Reservado"));
    });
    await act(async () => {
      fireEvent.press(reservedScreen.getByLabelText("Buscar outros livros da categoria Ficção"));
    });
    expect(onNavigateToCategorySearch).toHaveBeenCalledWith("Ficção");

    await act(async () => {
      fireEvent.press(reservedScreen.getByText("Reservado"));
    });
    await act(async () => {
      fireEvent.press(reservedScreen.getByLabelText("Ver perfil e outros anúncios de Carlos"));
    });
    expect(onNavigateToUserProfile).toHaveBeenCalledWith("other");

    await act(async () => {
      fireEvent.press(reservedScreen.getByText("Reservado"));
    });
    await act(async () => {
      fireEvent.press(reservedScreen.getByLabelText("Fechar informações da reserva"));
    });
  });

  it("abre e fecha a folha de proposta sem enviar", async () => {
    setup(book({ ownerId: "other", status: "available" }), user);
    const screen = await renderDetail();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Propor troca" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    });
  });
});
