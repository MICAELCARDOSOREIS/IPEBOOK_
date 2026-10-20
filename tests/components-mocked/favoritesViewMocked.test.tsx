import React from "react";
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
  const fullState: FavoritesState = { books: [], loading: false, error: null, removingId: null, ...state };
  const fullActions: FavoritesActions = {
    reload: vi.fn(),
    removeFavorite: vi.fn().mockResolvedValue(true),
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
});

describe("Favorites alinhada ao Figma 02.06 (Spec 028)", () => {
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

  it("mostra as abas com a contagem de livros favoritados", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} onNavigateToAlerts={vi.fn()} />,
      );
    });

    expect(screen.getByText("Livros (1)")).toBeDefined();
    expect(screen.getByText("Alertas")).toBeDefined();
  });

  it("mostra modalidade, preço, conservação e bairro na linha", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ books: [book] });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />);
    });

    expect(screen.getByText("O Pequeno Príncipe")).toBeDefined();
    expect(screen.getByText("R$ 25.00")).toBeDefined();
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

  it("leva aos alertas pela aba correspondente", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
    mock({ books: [] });
    const onNavigateToAlerts = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Favorites userId="u1" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} onNavigateToAlerts={onNavigateToAlerts} />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Alertas"));
    });

    expect(onNavigateToAlerts).toHaveBeenCalledTimes(1);
  });
});
