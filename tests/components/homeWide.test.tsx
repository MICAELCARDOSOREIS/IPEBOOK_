import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));
vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: null, loading: false }, { signIn: vi.fn(), signOut: vi.fn() }],
}));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));

import Home from "@/view/home";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);

const sampleBooks: Book[] = [
  {
    id: "b1",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    ownerId: "u1",
    modality: "sale",
    price: 20,
    status: "available",
    neighborhood: "Centro",
  },
  {
    id: "b2",
    title: "O Alquimista",
    author: "Paulo Coelho",
    ownerId: "u2",
    modality: "donation",
    status: "available",
    neighborhood: "Petecas",
  },
];

describe("Home na Web Larga (Spec 093 · Figma 02.01)", () => {
  it("exibe métricas comunitárias e oculta controles redundantes de topo", async () => {
    const mockState: HomeState = {
      books: sampleBooks,
      loading: false,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    // Oculta botão duplicado de Entrar e sino de notificações da página, pois já estão no WebHeader
    expect(screen.queryByLabelText("Entrar no aplicativo")).toBeNull();
    expect(screen.queryByLabelText("Abrir notificações")).toBeNull();

    // Exibe o banner de estatísticas comunitárias no hero
    expect(screen.getByTestId("home-community-stats")).toBeDefined();
    expect(screen.getAllByText("2")).toHaveLength(2);
    expect(screen.getByText("livros anunciados")).toBeDefined();
    expect(screen.getByText("bairros com leitores")).toBeDefined();
    expect(screen.getByText("doação disponível")).toBeDefined();
  });
});
