import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import CreateListingScreen from "@/view/listings/createListingScreen";
import ManageListingScreen from "@/view/listings/manageListingScreen";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";
import ReportListingScreen from "@/view/listings/reportListingScreen";
import FavoritesScreen from "@/view/favorites/favoritesScreen";
import SentRequestsScreen from "@/view/requests/sentRequests";
import ReceivedRequestsScreen from "@/view/requests/receivedRequests";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

vi.mock("@/viewmodel/useBookDetailViewModel", () => ({
  useBookDetailViewModel: vi.fn(),
}));

vi.mock("@/view/listings/createListing", () => ({
  default: vi.fn(({ sessionUserId }: { sessionUserId: string }) => {
    const { Text } = require("react-native");
    return <Text testID="create-listing-view">CreateListing: {sessionUserId}</Text>;
  }),
}));

vi.mock("@/view/listings/manageListing", () => ({
  default: vi.fn(({ bookId, sessionUserId }: { bookId: string; sessionUserId: string | null }) => {
    const { Text } = require("react-native");
    return <Text testID="manage-listing-view">ManageListing: {bookId} - {String(sessionUserId)}</Text>;
  }),
}));

vi.mock("@/view/search/searchAlerts", () => ({
  default: vi.fn(({ userId }: { userId: string | null }) => {
    const { Text } = require("react-native");
    return <Text testID="search-alerts-view">SearchAlerts: {String(userId)}</Text>;
  }),
}));

vi.mock("@/view/listings/reportListing", () => ({
  default: vi.fn(({ listingId, sessionUserId }: { listingId: string; sessionUserId: string | null }) => {
    const { Text } = require("react-native");
    return <Text testID="report-listing-view">ReportListing: {listingId} - {String(sessionUserId)}</Text>;
  }),
}));

vi.mock("@/view/favorites/favorites", () => ({
  default: vi.fn(({ userId }: { userId: string | null }) => {
    const { Text } = require("react-native");
    return <Text testID="favorites-view">Favorites: {String(userId)}</Text>;
  }),
}));

vi.mock("@/viewmodel/useSentRequestsViewModel", () => ({
  useSentRequestsViewModel: vi.fn(() => [{ items: [], loading: false, error: null }, { reload: vi.fn() }]),
}));

vi.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({
  useReceivedRequestsViewModel: vi.fn(() => [{ items: [], loading: false, error: null }, { reload: vi.fn() }]),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";

const mockedUseAuth = vi.mocked(useAuthViewModel);
const mockedUseBookDetail = vi.mocked(useBookDetailViewModel);

describe("Screen Wrappers e Gates de Sessão (ISO/IEC 25010 - Usabilidade e Segurança)", () => {
  describe("CreateListingScreen", () => {
    it("redireciona para login e não renderiza nada quando usuário não está autenticado", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: false, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
      });

      expect(onRequireSignIn).toHaveBeenCalledTimes(1);
      expect(screen.toJSON()).toBeNull();
    });

    it("não redireciona nem renderiza enquanto a autenticação está carregando", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: true, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
      });

      expect(onRequireSignIn).not.toHaveBeenCalled();
      expect(screen.toJSON()).toBeNull();
    });

    it("renderiza o formulário de cadastro quando usuário está logado", async () => {
      mockedUseAuth.mockReturnValue([{ user: { id: "user-42", email: "a@b.com" }, loading: false, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
      });

      expect(onRequireSignIn).not.toHaveBeenCalled();
      expect(screen.getByTestId("create-listing-view")).toBeDefined();
    });
  });

  describe("ManageListingScreen", () => {
    it("redireciona para login quando não há sessão", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: false, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ManageListingScreen bookId="b1" onRequireSignIn={onRequireSignIn} />);
      });

      expect(onRequireSignIn).toHaveBeenCalledTimes(1);
      expect(screen.toJSON()).toBeNull();
    });

    it("não redireciona enquanto a sessão carrega", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: true, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ManageListingScreen bookId="b1" onRequireSignIn={onRequireSignIn} />);
      });

      expect(onRequireSignIn).not.toHaveBeenCalled();
      expect(screen.toJSON()).toBeNull();
    });

    it("entrega o anúncio e a sessão para a tela de gerenciamento", async () => {
      mockedUseAuth.mockReturnValue([{ user: { id: "user-7", email: "a@b.com" }, loading: false, error: null }, {} as any]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ManageListingScreen bookId="b1" onRequireSignIn={vi.fn()} />);
      });

      expect(screen.getByTestId("manage-listing-view")).toBeDefined();
    });
  });

  describe("SearchAlertsScreen", () => {
    it("passa o id do usuário para SearchAlerts quando logado", async () => {
      mockedUseAuth.mockReturnValue([{ user: { id: "user-99", email: "x@y.com" }, loading: false, error: null }, {} as any]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<SearchAlertsScreen onBack={() => {}} onLogin={() => {}} />);
      });
      expect(screen.getByText("SearchAlerts: user-99")).toBeDefined();
    });

    it("passa null para SearchAlerts quando deslogado", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: false, error: null }, {} as any]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<SearchAlertsScreen onBack={() => {}} onLogin={() => {}} />);
      });
      expect(screen.getByText("SearchAlerts: null")).toBeDefined();
    });
  });

  describe("ReportListingScreen", () => {
    it("repasse de listingId e sessionUserId", async () => {
      mockedUseAuth.mockReturnValue([{ user: { id: "rep-1", email: "rep@exemplo.com" }, loading: false, error: null }, {} as any]);
      mockedUseBookDetail.mockReturnValue([{ book: { title: "Livro Denunciado" } } as any, {} as any]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(
          <ReportListingScreen listingId="book-denounce" onBack={() => {}} onNavigateToLogin={() => {}} />,
        );
      });
      expect(screen.getByText("ReportListing: book-denounce - rep-1")).toBeDefined();
    });
  });

  describe("FavoritesScreen", () => {
    it("renderiza Favorites passando userId da sessão", async () => {
      mockedUseAuth.mockReturnValue([{ user: { id: "fav-user", email: "f@exemplo.com" }, loading: false, error: null }, {} as any]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<FavoritesScreen onBook={() => {}} onLogin={() => {}} onBack={() => {}} />);
      });
      expect(screen.getByText("Favorites: fav-user")).toBeDefined();
    });
  });

  describe("SentRequestsScreen e ReceivedRequestsScreen", () => {
    it("SentRequestsScreen redireciona se não houver usuário", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: false, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<SentRequestsScreen onRequireSignIn={onRequireSignIn} />);
      });
      expect(onRequireSignIn).toHaveBeenCalledTimes(1);
      expect(screen.toJSON()).toBeNull();
    });

    it("ReceivedRequestsScreen redireciona se não houver usuário", async () => {
      mockedUseAuth.mockReturnValue([{ user: null, loading: false, error: null }, {} as any]);
      const onRequireSignIn = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ReceivedRequestsScreen onRequireSignIn={onRequireSignIn} />);
      });
      expect(onRequireSignIn).toHaveBeenCalledTimes(1);
      expect(screen.toJSON()).toBeNull();
    });
  });
});
