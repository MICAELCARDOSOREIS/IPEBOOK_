import { act, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { IFileDownloadService } from "@/model/services/iFileDownloadService";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import type { IUserDataExportUseCases } from "@/usecase/iUserDataExportUseCases";
import {
  clearAllSessionMemoryCaches,
  clearBooksMemoryCaches,
  registerBooksMemoryCache,
  registerSessionMemoryCache,
} from "@/viewmodel/sessionCacheRegistry";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useDeleteAccountViewModel } from "@/viewmodel/useDeleteAccountViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";
import { getCachedCatalogBookById, useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { getCachedMyListingById, useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

const sampleBookA: Book = {
  id: "book-a1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "user-a",
  modality: "sale",
  price: 25,
  status: "available",
};

const sampleBookCatalog: Book = {
  id: "book-cat-1",
  title: "Vidas Secas",
  author: "Graciliano Ramos",
  ownerId: "user-c",
  modality: "donation",
  status: "available",
};

const sampleBookDetail: Book = {
  id: "book-detail-1",
  title: "Capitães da Areia",
  author: "Jorge Amado",
  ownerId: "user-d",
  modality: "trade",
  status: "available",
};

const sampleDraftA: Book = {
  id: "draft-a1",
  title: "Rascunho Privado",
  author: "Autora",
  ownerId: "user-a",
  modality: "sale",
  price: 15,
  status: "draft",
};

async function withProdEnv<T>(fn: () => Promise<T>): Promise<T> {
  const previous = process.env.NODE_ENV;
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  try {
    return await fn();
  } finally {
    clearAllSessionMemoryCaches();
    (process.env as Record<string, string | undefined>).NODE_ENV = previous;
  }
}

function makeRateLimiter() {
  return {
    checkAndRecord: jest.fn().mockReturnValue({ allowed: true, remainingAttempts: 5, retryAfterMs: 0 }),
    reset: jest.fn(),
    getTimeUntilResetMs: jest.fn().mockReturnValue(0),
  };
}

function makeLogger() {
  return { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
}

describe("isolamento e limpeza de caches em memória dos ViewModels", () => {
  afterEach(() => {
    clearAllSessionMemoryCaches();
  });

  it("limpa caches de livros em clearBooksMemoryCaches sem apagar outros caches de sessão e suporta cancelamento", () => {
    const clearBooks = jest.fn();
    const clearSessionOnly = jest.fn();
    const unregisterBooks = registerBooksMemoryCache(clearBooks);
    const unregisterSession = registerSessionMemoryCache(clearSessionOnly);

    try {
      clearBooksMemoryCaches();
      expect(clearBooks).toHaveBeenCalledTimes(1);
      expect(clearSessionOnly).not.toHaveBeenCalled();

      clearAllSessionMemoryCaches();
      expect(clearBooks).toHaveBeenCalledTimes(2);
      expect(clearSessionOnly).toHaveBeenCalledTimes(1);
    } finally {
      unregisterBooks();
      unregisterSession();
    }

    clearAllSessionMemoryCaches();
    expect(clearBooks).toHaveBeenCalledTimes(2);
    expect(clearSessionOnly).toHaveBeenCalledTimes(1);
  });

  it("isola getCachedMyListingById por userId, limpa livros (inclusive detalhe) em Configurações e preserva cache só de sessão", async () => {
    await withProdEnv(async () => {
      const bookUseCases = {
        readMyListings: jest.fn().mockResolvedValue({ data: [sampleBookA], cachedAt: null }),
        listMyListings: jest.fn().mockResolvedValue([sampleBookA]),
        readCatalog: jest.fn().mockResolvedValue({ data: [sampleBookCatalog], cachedAt: null }),
        listBooks: jest.fn().mockResolvedValue([sampleBookCatalog]),
        readBookDetail: jest.fn().mockResolvedValue({ data: sampleBookDetail, cachedAt: null }),
        getBookById: jest.fn().mockResolvedValue(sampleBookDetail),
        listDrafts: jest.fn().mockResolvedValue([sampleDraftA]),
      } as unknown as IBookUseCases;
      const favorites = {
        isFavorite: jest.fn().mockResolvedValue(false),
        toggleFavorite: jest.fn().mockResolvedValue(false),
      } as unknown as IFavoriteUseCases;

      function PopulateHarness() {
        useMyListingsViewModel("user-a", bookUseCases);
        useHomeViewModel(bookUseCases);
        useBookDetailViewModel("book-detail-1", bookUseCases, favorites, "user-a");
        useDraftsViewModel("user-a", bookUseCases);
        return null;
      }

      await render(<PopulateHarness />);

      expect(getCachedMyListingById("book-a1", "user-a")?.id).toBe("book-a1");
      expect(getCachedMyListingById("book-a1", "user-b")).toBeNull();
      expect(getCachedMyListingById("book-a1", null)).toBeNull();
      expect(getCachedMyListingById("book-a1")).toBeNull();
      expect(getCachedCatalogBookById("book-cat-1")?.id).toBe("book-cat-1");

      let settingsActions: ReturnType<typeof useSettingsViewModel>[1] | null = null;
      const localCache: ILocalCacheUseCases = { clearBooksCache: jest.fn().mockResolvedValue(undefined) };
      const history: ISearchHistoryUseCases = {
        listTerms: jest.fn().mockResolvedValue([]),
        registerSearch: jest.fn().mockResolvedValue([]),
        clearHistory: jest.fn().mockResolvedValue(undefined),
      };

      function SettingsHarness() {
        const [, actions] = useSettingsViewModel(localCache, history);
        settingsActions = actions;
        return null;
      }

      await render(<SettingsHarness />);
      await act(async () => {
        await settingsActions?.clearBooksCache();
      });

      expect(localCache.clearBooksCache).toHaveBeenCalledTimes(1);
      expect(getCachedMyListingById("book-a1", "user-a")).toBeNull();
      expect(getCachedCatalogBookById("book-cat-1")).toBeNull();

      // Após limpar livros, o detalhe volta sem cache inicial (loading=true), mas rascunhos da sessão continuam aquecidos.
      let detailInitialLoading: boolean | null = null;
      let draftsInitialCount: number | null = null;
      const pendingBooks = {
        readBookDetail: jest.fn(() => new Promise(() => {})),
        getBookById: jest.fn(() => new Promise(() => {})),
        listDrafts: jest.fn(() => new Promise(() => {})),
      } as unknown as IBookUseCases;

      function VerifyAfterBooksClear() {
        const [detailState] = useBookDetailViewModel("book-detail-1", pendingBooks, favorites, "user-a");
        const [draftsState] = useDraftsViewModel("user-a", pendingBooks);
        if (detailInitialLoading === null) detailInitialLoading = detailState.loading;
        if (draftsInitialCount === null) draftsInitialCount = draftsState.drafts.length;
        return null;
      }

      await render(<VerifyAfterBooksClear />);
      expect(detailInitialLoading).toBe(true);
      expect(draftsInitialCount).toBe(1);
    });
  });

  it("limpa todos os caches em memória ao fazer logout ou trocar de conta no useAuthViewModel", async () => {
    await withProdEnv(async () => {
      const bookUseCases = {
        readMyListings: jest.fn().mockResolvedValue({ data: [sampleBookA], cachedAt: null }),
        listMyListings: jest.fn().mockResolvedValue([sampleBookA]),
        readCatalog: jest.fn().mockResolvedValue({ data: [sampleBookCatalog], cachedAt: null }),
        listBooks: jest.fn().mockResolvedValue([sampleBookCatalog]),
        listDrafts: jest.fn().mockResolvedValue([sampleDraftA]),
      } as unknown as IBookUseCases;

      const authUseCases = {
        getSession: jest.fn().mockResolvedValue({ id: "user-a", email: "a@ipebook.app", name: "Ana" }),
        signOut: jest.fn().mockResolvedValue(undefined),
        signIn: jest.fn().mockResolvedValue({ id: "user-b", email: "b@ipebook.app", name: "Beto" }),
        signUp: jest.fn(),
        requestPasswordReset: jest.fn(),
        completePasswordReset: jest.fn(),
        deleteAccount: jest.fn(),
      } as unknown as IAuthUseCases;

      let authActions: ReturnType<typeof useAuthViewModel>[1] | null = null;
      const rateLimiter = makeRateLimiter();
      const logger = makeLogger();

      function AuthAndBooksHarness() {
        useMyListingsViewModel("user-a", bookUseCases);
        useHomeViewModel(bookUseCases);
        useDraftsViewModel("user-a", bookUseCases);
        const [, actions] = useAuthViewModel(authUseCases, rateLimiter, logger);
        authActions = actions;
        return null;
      }

      await render(<AuthAndBooksHarness />);
      expect(getCachedMyListingById("book-a1", "user-a")?.id).toBe("book-a1");
      expect(getCachedCatalogBookById("book-cat-1")?.id).toBe("book-cat-1");

      // Troca de usuário (user-a -> user-b) limpa caches da conta anterior automaticamente.
      await act(async () => {
        await authActions?.signIn("b@ipebook.app", "12345678");
      });
      expect(getCachedMyListingById("book-a1", "user-a")).toBeNull();
      expect(getCachedCatalogBookById("book-cat-1")).toBeNull();

      // Reaquece para user-b e valida limpeza completa no signOut().
      const bookUseCasesB = {
        ...bookUseCases,
        readMyListings: jest.fn().mockResolvedValue({
          data: [{ ...sampleBookA, id: "book-b1", ownerId: "user-b" }],
          cachedAt: null,
        }),
      } as unknown as IBookUseCases;
      function RepopulateForB() {
        useMyListingsViewModel("user-b", bookUseCasesB);
        return null;
      }
      await render(<RepopulateForB />);
      expect(getCachedMyListingById("book-b1", "user-b")?.id).toBe("book-b1");

      await act(async () => {
        await authActions?.signOut();
      });

      expect(authUseCases.signOut).toHaveBeenCalledTimes(1);
      expect(getCachedMyListingById("book-b1", "user-b")).toBeNull();
    });
  });

  it("limpa todos os caches em memória ao excluir a conta via useDeleteAccountViewModel", async () => {
    await withProdEnv(async () => {
      const bookUseCases = {
        readMyListings: jest.fn().mockResolvedValue({ data: [sampleBookA], cachedAt: null }),
        listMyListings: jest.fn().mockResolvedValue([sampleBookA]),
        listDrafts: jest.fn().mockResolvedValue([sampleDraftA]),
      } as unknown as IBookUseCases;

      const authUseCases = {
        deleteAccount: jest.fn().mockResolvedValue(undefined),
      } as unknown as IAuthUseCases;
      const history: ISearchHistoryUseCases = {
        listTerms: jest.fn().mockResolvedValue([]),
        registerSearch: jest.fn().mockResolvedValue([]),
        clearHistory: jest.fn().mockResolvedValue(undefined),
      };
      const exportUseCases = { exportUserData: jest.fn() } as unknown as IUserDataExportUseCases;
      const download = { downloadJson: jest.fn() } as unknown as IFileDownloadService;
      let deleteActions: ReturnType<typeof useDeleteAccountViewModel>[1] | null = null;

      function DeleteHarness() {
        useMyListingsViewModel("user-a", bookUseCases);
        useDraftsViewModel("user-a", bookUseCases);
        const [, actions] = useDeleteAccountViewModel(authUseCases, history, exportUseCases, download);
        deleteActions = actions;
        return null;
      }

      await render(<DeleteHarness />);
      expect(getCachedMyListingById("book-a1", "user-a")?.id).toBe("book-a1");

      await act(async () => {
        deleteActions?.setConfirmed(true);
      });
      await act(async () => {
        const ok = await deleteActions?.deleteAccount("user-a");
        expect(ok).toBe(true);
      });

      expect(getCachedMyListingById("book-a1", "user-a")).toBeNull();

      // Confirma que rascunho da sessão excluída também foi limpo da memória.
      let draftsCount: number | null = null;
      const pendingDraftsBooks = {
        listDrafts: jest.fn(() => new Promise(() => {})),
      } as unknown as IBookUseCases;
      function VerifyDraftsCleared() {
        const [draftsState] = useDraftsViewModel("user-a", pendingDraftsBooks);
        if (draftsCount === null) draftsCount = draftsState.drafts.length;
        return null;
      }
      await render(<VerifyDraftsCleared />);
      expect(draftsCount).toBe(0);
    });
  });
});
