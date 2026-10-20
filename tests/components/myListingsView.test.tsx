import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
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

import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

const mockedUseMyListingsViewModel = vi.mocked(useMyListingsViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

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
  it("renderiza cabeçalho acessível com título Meus anúncios", async () => {
    mockViewModel({ books: [], loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByRole("header").props.children).toBe("Meus anúncios");
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

    expect(screen.getByText("Você ainda não cadastrou nenhum anúncio.")).toBeDefined();
    const btn = screen.getByRole("button", { name: "Cadastrar anúncio" });
    fireEvent.press(btn);
    expect(onNavigateToCreateListing).toHaveBeenCalledTimes(1);
  });

  it("renderiza anúncios com título, autor, modalidade e status", async () => {
    const fakeBook: Book = {
      id: "b1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "sale",
      price: 30,
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [fakeBook], loading: false, error: null });
    const onNavigateToBookDetail = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MyListings
          sessionUserId="user-1"
          onNavigateToBookDetail={onNavigateToBookDetail}
        />,
      );
    });

    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.getByText("Venda")).toBeDefined();
    expect(screen.getByText("Disponível")).toBeDefined();
    expect(screen.getByText("R$ 30.00")).toBeDefined();

    const bookItem = screen.getByRole("button", {
      name: "Ver detalhe de Dom Casmurro, Machado de Assis",
    });
    fireEvent.press(bookItem);
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("b1");
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

  it("exibe diálogo de confirmação ao remover livro e só executa remoção após confirmação", async () => {
    const book: Book = {
      id: "b1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "sale",
      price: 20,
      ownerId: "user-1",
      status: "available",
    };
    const actions = mockViewModel({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    const removeBtn = screen.getByRole("button", { name: "Remover anúncio de Dom Casmurro" });
    expect(removeBtn).toBeDefined();

    // 1. Clicar em Remover abre o diálogo de confirmação
    await act(async () => {
      fireEvent.press(removeBtn);
    });

    expect(screen.getByText("Excluir anúncio?")).toBeDefined();
    expect(
      screen.getByText(
        'Tem certeza de que deseja excluir o anúncio de "Dom Casmurro"? Esta ação não pode ser desfeita.',
      ),
    ).toBeDefined();

    // 2. Clicar em Cancelar fecha o diálogo sem chamar cancelListing
    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(actions.cancelListing).not.toHaveBeenCalled();
    expect(screen.queryByText("Excluir anúncio?")).toBeNull();

    // 3. Clicar novamente em Remover e desta vez confirmar a exclusão
    await act(async () => {
      fireEvent.press(removeBtn);
    });

    const confirmBtn = screen.getByRole("button", { name: "Excluir anúncio" });
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    expect(actions.cancelListing).toHaveBeenCalledWith("b1");
    expect(
      screen.getByText('Anúncio de "Dom Casmurro" excluído com sucesso.'),
    ).toBeDefined();
  });

  it("renderiza badge Pausado e botão Retomar quando anúncio estiver pausado", async () => {
    const book: Book = {
      id: "b1",
      title: "Livro Pausado",
      author: "Autor",
      modality: "trade",
      ownerId: "user-1",
      status: "paused",
    };
    const actions = mockViewModel({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByText("Pausado")).toBeDefined();
    const resumeBtn = screen.getByRole("button", { name: "Retomar anúncio de Livro Pausado" });
    expect(resumeBtn).toBeDefined();

    await act(async () => {
      fireEvent.press(resumeBtn);
    });

    expect(actions.togglePauseListing).toHaveBeenCalledWith("b1");
  });

  it("permite pausar anúncio disponível e chama togglePauseListing", async () => {
    const book: Book = {
      id: "b2",
      title: "Livro Ativo",
      author: "Autor",
      modality: "donation",
      ownerId: "user-1",
      status: "available",
    };
    const actions = mockViewModel({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    const pauseBtn = screen.getByRole("button", { name: "Pausar anúncio de Livro Ativo" });
    expect(pauseBtn).toBeDefined();

    await act(async () => {
      fireEvent.press(pauseBtn);
    });

    expect(actions.togglePauseListing).toHaveBeenCalledWith("b2");
  });

  it("navega para tela de edição ao pressionar botão Editar", async () => {
    const book: Book = {
      id: "b3",
      title: "Livro Editável",
      author: "Autor",
      modality: "donation",
      ownerId: "user-1",
      status: "available",
    };
    mockViewModel({ books: [book] });
    const onNavigateToEditListing = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <MyListings sessionUserId="user-1" onNavigateToEditListing={onNavigateToEditListing} />,
      );
    });

    const editBtn = screen.getByRole("button", { name: "Editar anúncio de Livro Editável" });
    expect(editBtn).toBeDefined();

    await act(async () => {
      fireEvent.press(editBtn);
    });

    expect(onNavigateToEditListing).toHaveBeenCalledWith("b3");
  });

  it("não exibe botões de editar e pausar quando o anúncio estiver reservado", async () => {
    const book: Book = {
      id: "b4",
      title: "Livro Reservado",
      author: "Autor",
      modality: "donation",
      ownerId: "user-1",
      status: "reserved",
    };
    mockViewModel({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-1" />);
    });

    expect(screen.getByText("Reservado")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Editar anúncio de Livro Reservado" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Pausar anúncio de Livro Reservado" })).toBeNull();
  });
});
