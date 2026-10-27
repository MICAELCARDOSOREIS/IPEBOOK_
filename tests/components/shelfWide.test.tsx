import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { MyListingsActions, MyListingsState } from "@/viewmodel/useMyListingsViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));
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
});
