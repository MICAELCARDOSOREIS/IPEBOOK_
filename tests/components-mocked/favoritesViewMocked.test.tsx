import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { FavoritesActions, FavoritesState } from "@/viewmodel/useFavoritesViewModel";
import Favorites from "@/view/favorites/favorites";

vi.mock("@/viewmodel/useFavoritesViewModel", () => ({ useFavoritesViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

function mock(state: Partial<FavoritesState>, actions: Partial<FavoritesActions> = {}) {
  const fullState: FavoritesState = { books: [], loading: false, error: null, ...state };
  const fullActions: FavoritesActions = { reload: vi.fn(), ...actions };
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
