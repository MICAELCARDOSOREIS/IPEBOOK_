
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));

import { OwnerListings } from "@/view/listings/ownerListings";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);

const books: Book[] = [
  {
    id: "venda",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    ownerId: "ana",
    modality: "sale",
    price: 20,
    status: "available",
  },
  {
    id: "troca",
    title: "O Alquimista",
    author: "Paulo Coelho",
    ownerId: "ana",
    modality: "trade",
    status: "available",
  },
  {
    id: "doacao",
    title: "Iracema",
    author: "José de Alencar",
    ownerId: "ana",
    modality: "donation",
    status: "available",
  },
  {
    id: "rascunho",
    title: "Rascunho",
    author: "Ana",
    ownerId: "ana",
    modality: "donation",
    status: "draft",
  },
  {
    id: "outra-pessoa",
    title: "Livro de outra pessoa",
    author: "Beto",
    ownerId: "beto",
    modality: "sale",
    price: 15,
    status: "available",
  },
];

function stateWith(overrides: Partial<HomeState>): [HomeState, HomeActions] {
  return [{ books: [], loading: false, error: null, ...overrides }, { reload: vi.fn() }];
}

describe("OwnerListings (perfil público na web larga)", () => {
  it("lista apenas os anúncios publicados da pessoa, com contagem e modalidades", async () => {
    mockedUseHomeViewModel.mockReturnValue(stateWith({ books }));
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<OwnerListings ownerId="ana" ownerName="Ana Paula" />);
    });

    expect(screen.getByText("Anúncios de Ana Paula (3)")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("R$ 20,00")).toBeDefined();
    expect(screen.getByText("Para trocar")).toBeDefined();
    expect(screen.getByText("Gratuito")).toBeDefined();
    expect(screen.queryByText("Rascunho")).toBeNull();
    expect(screen.queryByText("Livro de outra pessoa")).toBeNull();
  });

  it("aciona onOpenBook com o id do livro tocado", async () => {
    mockedUseHomeViewModel.mockReturnValue(stateWith({ books }));
    const onOpenBook = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <OwnerListings ownerId="ana" ownerName="Ana Paula" onOpenBook={onOpenBook} />,
      );
    });

    fireEvent.press(screen.getByLabelText("Ver Dom Casmurro"));

    expect(onOpenBook).toHaveBeenCalledWith("venda");
  });

  it("não renderiza durante o carregamento", async () => {
    mockedUseHomeViewModel.mockReturnValue(stateWith({ loading: true, books }));
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<OwnerListings ownerId="ana" ownerName="Ana Paula" />);
    });

    expect(screen.queryByTestId("owner-listings")).toBeNull();
  });

  it("não renderiza quando a pessoa não tem anúncios publicados", async () => {
    mockedUseHomeViewModel.mockReturnValue(stateWith({ books: [] }));
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<OwnerListings ownerId="ana" ownerName="Ana Paula" />);
    });

    expect(screen.queryByTestId("owner-listings")).toBeNull();
  });

  it("mostra o erro com tentativa nova em vez de esconder a seção", async () => {
    const reload = vi.fn();
    mockedUseHomeViewModel.mockReturnValue([
      { books: [], loading: false, error: "Não foi possível carregar os anúncios." },
      { reload },
    ]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<OwnerListings ownerId="ana" ownerName="Ana Paula" />);
    });

    expect(screen.getByTestId("owner-listings-error")).toBeDefined();
    expect(screen.getByText("Não foi possível carregar os anúncios.")).toBeDefined();

    fireEvent.press(screen.getByLabelText("Tentar novamente"));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
