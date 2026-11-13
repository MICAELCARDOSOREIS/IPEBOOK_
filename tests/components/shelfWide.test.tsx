
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { MyListingsActions, MyListingsState } from "@/viewmodel/useMyListingsViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));
vi.mock("@/viewmodel/useMyListingsViewModel", () => ({ useMyListingsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: { id: "u1" }, loading: false }, {}],
}));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
vi.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({
  useReceivedRequestsViewModel: () => [{ items: [], loading: false, error: null }, { reload: vi.fn() }],
}));

import { MyListings } from "@/view/listings/myListings";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";

const mockedUseMyListings = vi.mocked(useMyListingsViewModel);

const sampleBook: Book = {
  id: "b1",
  title: "Capitães da Areia",
  author: "Jorge Amado",
  ownerId: "u1",
  modality: "trade",
  status: "available",
};

describe("Estante na Web Larga (Spec 093 · Figma 05.01)", () => {
  it("exibe o banner convidativo de troca e circulação com chamada para anunciar", async () => {
    const mockState: MyListingsState = {
      books: [sampleBook],
      loading: false,
      error: null,
      cancellingId: null,
      cancelError: null,
      pausingId: null,
      pauseError: null,
    };
    const mockActions: MyListingsActions = {
      reload: vi.fn(),
      cancelListing: vi.fn(),
      togglePauseListing: vi.fn(),
    };
    mockedUseMyListings.mockReturnValue([mockState, mockActions]);

    const onNavigateToCreateListing = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MyListings sessionUserId="u1" onNavigateToCreateListing={onNavigateToCreateListing} />,
      );
    });

    expect(screen.getByTestId("shelf-exchange-banner")).toBeDefined();
    expect(screen.getByText("Quer fazer seus livros circularem?")).toBeDefined();

    const announceBtn = screen.getByLabelText("Anunciar novo livro na estante");
    await act(async () => {
      fireEvent.press(announceBtn);
    });
    expect(onNavigateToCreateListing).toHaveBeenCalled();
  });

  it("renderiza tabela na web com colunas completas, autor, bairro e botão de ação", async () => {
    const bookWithDetails: Book = {
      id: "b2",
      title: "Grande Sertão: Veredas",
      author: "Guimarães Rosa",
      ownerId: "u1",
      modality: "sale",
      price: 45,
      neighborhood: "Centro",
      status: "available",
      isBox: true,
      boxVolumesCount: 2,
    };
    const mockState: MyListingsState = {
      books: [bookWithDetails],
      loading: false,
      error: null,
      cancellingId: null,
      cancelError: null,
      pausingId: null,
      pauseError: null,
    };
    const mockActions: MyListingsActions = {
      reload: vi.fn(),
      cancelListing: vi.fn(),
      togglePauseListing: vi.fn(),
    };
    mockedUseMyListings.mockReturnValue([mockState, mockActions]);

    const onNavigateToManageListing = vi.fn();
    const onNavigateToCreateListing = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MyListings
          sessionUserId="u1"
          onNavigateToManageListing={onNavigateToManageListing}
          onNavigateToCreateListing={onNavigateToCreateListing}
        />,
      );
    });

    // Cabeçalho da tabela web
    expect(screen.getByText("Livro")).toBeDefined();
    expect(screen.getByText("Modalidade")).toBeDefined();
    expect(screen.getByText("Local")).toBeDefined();
    expect(screen.getByText("Situação")).toBeDefined();
    expect(screen.getByText("Ação")).toBeDefined();

    // Dados na linha da tabela
    expect(screen.getByText("Grande Sertão: Veredas")).toBeDefined();
    expect(screen.getByText("Guimarães Rosa")).toBeDefined();
    expect(screen.getByText("Box (2 vols)")).toBeDefined();
    expect(screen.getByText("Piripiri")).toBeDefined();
    expect(screen.getByText("R$ 45,00")).toBeDefined();
    expect(screen.getByText("Disponível")).toBeDefined();

    // Botão Editar / Gerenciar
    const editBtn = screen.getByText("Editar");
    await act(async () => {
      fireEvent.press(editBtn);
    });
    expect(onNavigateToManageListing).toHaveBeenCalledWith("b2");

    // Botão de anunciar no topo do cabeçalho web
    const headerAnnounceBtn = screen.getByLabelText("Anunciar livro no topo da estante");
    await act(async () => {
      fireEvent.press(headerAnnounceBtn);
    });
    expect(onNavigateToCreateListing).toHaveBeenCalled();
  });
});
