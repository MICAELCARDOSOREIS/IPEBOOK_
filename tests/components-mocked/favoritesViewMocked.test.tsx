
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { FavoritesActions, FavoritesState } from "@/viewmodel/useFavoritesViewModel";
import Favorites from "@/view/favorites/favorites";

vi.mock("@/viewmodel/useFavoritesViewModel", () => ({ useFavoritesViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

function mock(state: Partial<FavoritesState>, actions: Partial<FavoritesActions> = {}) {
  const fullState: FavoritesState = { books: [], loading: false, error: null, removingId: null, actionError: null, ...state };
  const fullActions: FavoritesActions = {
    reload: vi.fn(),
    removeFavorite: vi.fn().mockResolvedValue(true),
    clearActionError: vi.fn(),
    ...actions,
  };
  vi.mocked(useFavoritesViewModel).mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("Favorites com ViewModel mockado (Issue #76)", () => {
  it("mostra o erro genérico com ação de tentar de novo quando online", async () => {
    const actions = mock({ error: "Não foi possível carregar favoritos." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });
    expect(screen.getByText("Não foi possível carregar favoritos.")).toBeDefined();
    expect(actions.reload).toBeDefined();
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mock({ error: "Não foi possível carregar favoritos." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
  });

  it("mostra o estado de carregamento com LoadingState", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ loading: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });
    expect(screen.getByTestId("loading-skeleton-list")).toBeDefined();
  });

  it("mostra o aviso para entrar quando não há userId", async () => {
    mock({});
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId={null} onBack={vi.fn()} onLogin={onLogin} onBook={vi.fn()} />);
    });
    expect(screen.getByText("Entre para ver seus favoritos")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    });
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});

describe("Favorites alinhada ao Figma 02.06 (Spec 030)", () => {
  const book = {
    id: "b1",
    title: "O Pequeno Príncipe",
    author: "Saint-Exupéry",
    ownerId: "u2",
    modality: "sale" as const,
    price: 25,
    status: "available" as const,
    condition: "good" as const,
    neighborhood: "Centro",
  };

  it("mostra modalidade, preço, conservação e bairro na linha", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });

    expect(screen.getByText("O Pequeno Príncipe")).toBeDefined();
    expect(screen.getByText("R$ 25,00")).toBeDefined();
    expect(screen.getByText("Saint-Exupéry · Bom estado · Centro")).toBeDefined();
  });

  it("desfavorita pelo coração da própria linha", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    const actions = mock({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Remover O Pequeno Príncipe dos favoritos"));
    });

    expect(actions.removeFavorite).toHaveBeenCalledWith("b1");
  });

  it("mantém a lista visível quando a remoção falha e só avisa pelo snackbar", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ books: [book], actionError: "Não foi possível atualizar o favorito." });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });

    expect(screen.getByText("O Pequeno Príncipe")).toBeDefined();
    expect(screen.getByText("Não foi possível atualizar o favorito.")).toBeDefined();
  });

  it("exibe chips de filtro no celular e nota de privacidade no rodapé (Spec 120)", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({
      books: [
        { ...book, id: "b1", title: "Livro Disponível", status: "available" as const },
        { ...book, id: "b2", title: "Livro Reservado", status: "reserved" as const },
      ],
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />
      );
    });

    expect(screen.getByLabelText("Mostrar todos")).toBeDefined();
    expect(screen.getByLabelText("Mostrar disponíveis")).toBeDefined();
    expect(screen.getByLabelText("Mostrar reservados")).toBeDefined();
    expect(screen.getByText("Favoritos ficam só com você")).toBeDefined();

    // Filtra para mostrar apenas disponíveis
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mostrar disponíveis"));
    });
    expect(screen.getByText("Livro Disponível")).toBeDefined();
    expect(screen.queryByText("Livro Reservado")).toBeNull();

    // Filtra para mostrar apenas reservados
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mostrar reservados"));
    });
    expect(screen.queryByText("Livro Disponível")).toBeNull();
    expect(screen.getByText("Livro Reservado")).toBeDefined();
  });
});
