
import { act, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";

jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));
jest.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: null, loading: false }, { signIn: jest.fn(), signOut: jest.fn() }],
}));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));

import Home from "@/view/home";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

const mockedUseHomeViewModel = jest.mocked(useHomeViewModel);

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
    const mockActions: HomeActions = { reload: jest.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    // Oculta botão duplicado de Entrar e sino de notificações da página, pois já estão no WebHeader
    expect(screen.queryByLabelText("Entrar no aplicativo")).toBeNull();
    expect(screen.queryByLabelText("Abrir notificações")).toBeNull();

    // Exibe o banner de estatísticas comunitárias no hero e chips de filtro em linha
    expect(screen.getByTestId("home-community-stats")).toBeDefined();
    expect(screen.getByTestId("home-quick-filter-chips")).toBeDefined();
    expect(screen.getAllByText("2")).toHaveLength(2);
    expect(screen.getByText("livros anunciados")).toBeDefined();
    expect(screen.getByText("bairros com leitores")).toBeDefined();
    expect(screen.getByText("doação disponível")).toBeDefined();
    expect(screen.getByText("1 livro gratuito em Piripiri")).toBeDefined();
  });
});
