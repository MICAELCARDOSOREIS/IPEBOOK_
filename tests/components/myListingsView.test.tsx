import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Platform, StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { MyListingsState, MyListingsActions } from "@/viewmodel/useMyListingsViewModel";
import MyListingsScreen, { MyListings } from "@/view/listings/myListings";

vi.mock("@/viewmodel/useMyListingsViewModel", () => ({
  useMyListingsViewModel: vi.fn(),
}));

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));
vi.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({ useReceivedRequestsViewModel: vi.fn() }));

import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";

const mockedUseMyListingsViewModel = vi.mocked(useMyListingsViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

function mockReceived(items: RequestWithListing[]) {
  vi.mocked(useReceivedRequestsViewModel).mockReturnValue([
    { items, loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
    { reload: vi.fn(), accept: vi.fn(), reject: vi.fn() },
  ]);
}
mockReceived([]);

function mockViewModel(
  state: Partial<MyListingsState> = {},
  actions: Partial<MyListingsActions> = {},
) {
  const fullState: MyListingsState = {
    books: [],
    loading: false,
    error: null,
    cancellingId: null,
    cancelError: null,
    pausingId: null,
    pauseError: null,
    ...state,
  };
  const fullActions: MyListingsActions = {
    reload: vi.fn().mockResolvedValue(undefined),
    cancelListing: vi.fn().mockResolvedValue(true),
    togglePauseListing: vi.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseMyListingsViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("tela de Meus Anúncios (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("renderiza cabeçalho Estante com subtítulo (Spec 075, CA1)", async () => {
    mockViewModel({ books: [], loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByRole("header").props.children).toBe("Estante");
    expect(screen.getByText("Seus livros em Piripiri")).toBeDefined();
  });

  it("resume os anúncios por modalidade em três cartões (Spec 075, CA2)", async () => {
    const base = { author: "A", ownerId: "user-1", status: "available" as const };
    mockViewModel({
      books: [
        { ...base, id: "s1", title: "V1", modality: "sale" },
        { ...base, id: "s2", title: "V2", modality: "sale" },
        { ...base, id: "t1", title: "T1", modality: "trade" },
      ],
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });
    expect(screen.getByLabelText("2 à venda")).toBeDefined();
    expect(screen.getByLabelText("1 em troca")).toBeDefined();
    expect(screen.getByLabelText("0 para doar")).toBeDefined();
  });

  it("mostra Precisa da sua atenção com Ver proposta para proposta pendente (Spec 075, CA4)", async () => {
    const book: Book = { id: "b20", title: "Vidas Secas", author: "G", modality: "trade", ownerId: "user-1", status: "available" };
    mockViewModel({ books: [book] });
    mockReceived([
      { request: { id: "r20", listingId: "b20", requesterId: "u-lu", status: "pending" }, listing: book, requesterName: "Lucas" },
    ]);
    const onNavigateToReceivedRequests = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" onNavigateToReceivedRequests={onNavigateToReceivedRequests} />);
    });
    expect(screen.getByText("Precisa da sua atenção")).toBeDefined();
    expect(screen.getByText("Lucas quer trocar")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Ver proposta")); });
    expect(onNavigateToReceivedRequests).toHaveBeenCalledTimes(1);
    mockReceived([]);
  });

  it("não acrescenta manchete e mostra a dica depois da lista (Spec 039, Figma 05.01)", async () => {
    const book: Book = {
      id: "b-038",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "trade",
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [book], loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.queryByText("Cada livro, uma conversa.")).toBeNull();
    expect(
      screen.getByText("Toque em um livro para editar, pausar ou marcar como concluído."),
    ).toBeDefined();
  });

  it("exibe mensagem e botão de cadastrar quando não há anúncios", async () => {
    mockViewModel({ books: [], loading: false, error: null });
    const onNavigateToCreateListing = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MyListings
          sessionUserId="user-1"
          onNavigateToCreateListing={onNavigateToCreateListing}
        />,
      );
    });

    expect(screen.getByText("Sua estante começa com um livro")).toBeDefined();
    expect(screen.getByText("Sua estante começa com um livro")).toBeDefined();
    const btn = screen.getByRole("button", { name: "Cadastrar anúncio" });
    fireEvent.press(btn);
    expect(onNavigateToCreateListing).toHaveBeenCalledTimes(1);
  });

  it("no celular o Anunciar livro é um único FAB do Material 3 no canto inferior, não um botão no cabeçalho", async () => {
    const livro: Book = { id: "b13", title: "Iracema", author: "Alencar", modality: "trade", ownerId: "user-1", status: "available" };
    mockViewModel({ books: [livro] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" onNavigateToCreateListing={vi.fn()} />);
    });
    const fabs = screen.getAllByLabelText("Anunciar livro");
    expect(fabs).toHaveLength(1);
    const raw = fabs[0].props.style;
    const resolved = typeof raw === "function" ? raw({ pressed: false }) : raw;
    const style = Object.assign({}, ...[resolved].flat(Infinity).filter(Boolean));
    expect(style).toMatchObject({ position: "absolute", width: 56, height: 56 });
  });

  it("lista cada anúncio como linha com resumo e seta para o gerenciamento (Spec 043, RN-04)", async () => {
    const fakeBook: Book = {
      id: "b1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "sale",
      price: 30,
      ownerId: "user-1",
      status: "available",
      neighborhood: "Centro",
    };
    mockViewModel({ books: [fakeBook], loading: false, error: null });
    const onNavigateToManageListing = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MyListings sessionUserId="user-1" onNavigateToManageListing={onNavigateToManageListing} />,
      );
    });

    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("R$ 30,00 · Centro · Disponível")).toBeDefined();
    // As ações ficam em `04.08`; a linha não repete botões de editar, pausar e remover.
    expect(screen.queryByText("Editar")).toBeNull();
    expect(screen.queryByText("Remover")).toBeNull();

    fireEvent.press(screen.getByRole("button", { name: "Gerenciar anúncio de Dom Casmurro" }));
    expect(onNavigateToManageListing).toHaveBeenCalledWith("b1");
  });

  it("resume troca e doação pela modalidade e mostra a situação (Figma 05.01)", async () => {
    const books: Book[] = [
      { id: "b5", title: "Vidas Secas", author: "Graciliano Ramos", modality: "trade", ownerId: "user-1", status: "reserved", neighborhood: "Centro" },
      { id: "b6", title: "O Quinze", author: "Rachel de Queiroz", modality: "donation", ownerId: "user-1", status: "paused" },
    ];
    mockViewModel({ books });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByText("Troca · Centro · Reservado")).toBeDefined();
    expect(screen.getByText("Doação · Pausado")).toBeDefined();
  });

  it("exibe indicador de carregamento", async () => {
    mockViewModel({ books: [], loading: true, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByLabelText("Carregando seus anúncios")).toBeDefined();
  });

  it("exibe mensagem de erro e botão de nova tentativa", async () => {
    const actions = mockViewModel({
      books: [],
      loading: false,
      error: "Erro de conexão.",
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByRole("alert").props.children).toBe("Erro de conexão.");
    const retryBtn = screen.getByRole("button", { name: "Tentar novamente" });
    fireEvent.press(retryBtn);
    expect(actions.reload).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline (Issue #76)", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockViewModel({ books: [], loading: false, error: "Erro de conexão." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<MyListings sessionUserId="user-1" />); });
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });

  it("MyListingsScreen redireciona para login se o usuário não estiver autenticado", async () => {
    mockedUseAuthViewModel.mockReturnValue([
      { user: null, loading: false, error: null },
      { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ]);
    const onRequireSignIn = vi.fn();

    await act(async () => {
      await render(<MyListingsScreen onRequireSignIn={onRequireSignIn} />);
    });

    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });

  it("aba Propostas conta e lista as propostas recebidas em aberto (Spec 043, RN-03)", async () => {
    const book: Book = {
      id: "b10",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "trade",
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [book] });
    mockReceived([
      { request: { id: "r1", listingId: "b10", requesterId: "u-ana", status: "pending" }, listing: book, requesterName: "Ana Paula" },
      { request: { id: "r2", listingId: "b10", requesterId: "u-bruno", status: "accepted" }, listing: book, requesterName: null },
      { request: { id: "r3", listingId: "b10", requesterId: "u-caio", status: "rejected" }, listing: book, requesterName: "Caio" },
    ]);
    const onNavigateToReceivedRequests = vi.fn();
    const onNavigateToNegotiationDetail = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <MyListings
          sessionUserId="user-1"
          onNavigateToReceivedRequests={onNavigateToReceivedRequests}
          onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
        />,
      );
    });

    // Livro sem reserva com proposta pendente: antes a aba mostrava "Propostas (0)".
    expect(screen.getByLabelText("Propostas, 2 em aberto")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Propostas, 2 em aberto"));
    });

    expect(screen.getByText("Ana Paula · proposta recebida · Troca")).toBeDefined();
    expect(screen.getByText("Pessoa da comunidade · negociação aceita · Troca")).toBeDefined();
    expect(screen.queryByText(/Caio/)).toBeNull();
    expect(screen.queryByText("Todos (1)")).toBeNull();
    expect(screen.getByText("Tudo pela conversa")).toBeDefined();

    const rows = screen.getAllByRole("button", { name: "Abrir proposta para Dom Casmurro" });
    await act(async () => {
      fireEvent.press(rows[0]);
    });
    expect(onNavigateToReceivedRequests).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.press(rows[1]);
    });
    expect(onNavigateToNegotiationDetail).toHaveBeenCalledWith("r2");
    mockReceived([]);
  });

  it("aba Propostas sem propostas mostra estado próprio e volta para Anúncios (Spec 075, CA5)", async () => {
    mockViewModel({
      books: [{ id: "b1", title: "Livro", author: "A", modality: "sale", ownerId: "user-1", status: "available" }],
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Propostas"));
    });
    expect(screen.getByText("Nenhuma proposta agora.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Ver meus anúncios")); });
    expect(screen.getByText("Livro")).toBeDefined();
  });

  it("oferece o botão Anunciar livro quando já existe estante (Figma 05.01)", async () => {
    const livro: Book = {
      id: "b12",
      title: "Memórias Póstumas",
      author: "Machado de Assis",
      modality: "donation",
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [livro] });
    const onNavigateToCreateListing = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <MyListings sessionUserId="user-1" onNavigateToCreateListing={onNavigateToCreateListing} />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Anunciar livro"));
    });

    expect(onNavigateToCreateListing).toHaveBeenCalledTimes(1);
  });

  it("filtra a estante por status (Todos, Ativos, Pausados, Reservados) e mostra estado vazio contextual (Issue #161)", async () => {
    const books: Book[] = [
      {
        id: "b1",
        title: "Dom Casmurro",
        author: "Machado de Assis",
        modality: "sale",
        price: 25,
        ownerId: "user-1",
        status: "available",
      },
      {
        id: "b2",
        title: "O Quinze",
        author: "Rachel de Queiroz",
        modality: "trade",
        ownerId: "user-1",
        status: "paused",
      },
    ];
    mockViewModel({ books });
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByText("Todos (2)")).toBeDefined();
    expect(screen.getByText("Ativos (1)")).toBeDefined();
    expect(screen.getByText("Pausados (1)")).toBeDefined();
    expect(screen.getByText("Reservados (0)")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Pausados"));
    });
    expect(screen.getByText("O Quinze")).toBeDefined();
    expect(screen.queryByText("Dom Casmurro")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Reservados"));
    });
    expect(screen.getByText("Nenhum anúncio encontrado neste filtro.")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Ver todos os anúncios" }));
    });
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("O Quinze")).toBeDefined();
  });

  it("renderiza a aba Concluídos e exibe estado vazio ou livros finalizados (Spec 064, Figma 05.01)", async () => {
    const book: Book = {
      id: "b-conc",
      title: "Vidas Secas",
      author: "Graciliano Ramos",
      modality: "trade",
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [book] });
    mockReceived([
      {
        request: { id: "req-c1", listingId: "b-conc", requesterId: "u-lucas", status: "rejected" },
        listing: book,
        requesterName: "Lucas Mendes",
      },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByLabelText("Concluídos")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Concluídos"));
    });

    expect(screen.getByText("Vidas Secas")).toBeDefined();
    expect(screen.getByText("Lucas Mendes · Concluído · Troca")).toBeDefined();
  });

  it("não exibe botão de voltar quando onBack não é fornecido (Spec 064)", async () => {
    mockViewModel({ books: [] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.queryByLabelText("Voltar")).toBeNull();
  });

  it("exibe botão de voltar quando onBack é fornecido (Spec 064)", async () => {
    mockViewModel({ books: [] });
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" onBack={onBack} />);
    });

    const backBtn = screen.getByLabelText("Voltar");
    expect(backBtn).toBeDefined();
    fireEvent.press(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["ios", 9],
    ["android", undefined],
  ] as const)("usa o seletor de abas da plataforma %s (Spec 075, CA6/CA7)", async (os, trackRadius) => {
    const originalOS = Platform.OS;
    Platform.OS = os;
    mockViewModel({
      books: [{ id: "b1", title: "Livro", author: "A", modality: "sale", ownerId: "user-1", status: "available" }],
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });
    const style = StyleSheet.flatten(screen.getByTestId("my-listings-tablist").props.style);
    expect(style.borderRadius).toBe(trackRadius);
    Platform.OS = originalOS;
  });
});
