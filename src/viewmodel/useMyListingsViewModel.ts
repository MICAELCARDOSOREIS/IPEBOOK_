import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { registerBooksMemoryCache } from "@/viewmodel/sessionCacheRegistry";

export type MyListingsState = {
  books: readonly Book[];
  cachedAt?: number | null;
  loading: boolean;
  error: string | null;
  cancellingId: string | null;
  cancelError: string | null;
  pausingId: string | null;
  pauseError: string | null;
};

export type MyListingsActions = {
  reload: () => Promise<void>;
  cancelListing: (bookId: string) => Promise<boolean>;
  togglePauseListing: (bookId: string) => Promise<boolean>;
};

const sessionMyListingsCache = new Map<string, readonly Book[]>();

registerBooksMemoryCache(() => {
  sessionMyListingsCache.clear();
});

export function getCachedMyListingById(bookId: string, userId?: string | null): Book | null {
  if (process.env.NODE_ENV === "test" || !userId) return null;
  const list = sessionMyListingsCache.get(userId);
  return list?.find((b) => b.id === bookId) ?? null;
}

export function useMyListingsViewModel(
  sessionUserId: string | null,
  books: IBookUseCases,
): [MyListingsState, MyListingsActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached = !isTest && sessionUserId ? (sessionMyListingsCache.get(sessionUserId) ?? null) : null;
  const [state, setState] = useState<MyListingsState>({
    books: initialCached ?? [],
    cachedAt: null,
    loading: initialCached === null,
    error: null,
    cancellingId: null,
    cancelError: null,
    pausingId: null,
    pauseError: null,
  });
  const active = useRef(false);
  const request = useRef(0);
  const booksRef = useRef<readonly Book[]>(state.books);
  booksRef.current = state.books;

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({
      ...previous,
      loading: previous.books.length === 0,
      error: null,
      cancelError: null,
      pauseError: null,
    }));
    try {
      const { data, cachedAt } = await (books.readMyListings?.(sessionUserId) ??
        books.listMyListings(sessionUserId).then((result) => ({ data: result, cachedAt: null })));
      if (!isTest && sessionUserId && cachedAt === null) sessionMyListingsCache.set(sessionUserId, data);
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          books: data,
          cachedAt,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof DomainError
              ? error.message
              : "Não foi possível carregar seus anúncios. Tente novamente.",
        }));
      }
    }
  }, [books, sessionUserId, isTest]);

  const cancelListing = useCallback(
    async (bookId: string): Promise<boolean> => {
      const previousBooks = booksRef.current;
      const optimisticBooks = previousBooks.filter((b) => b.id !== bookId);
      if (!isTest && sessionUserId) sessionMyListingsCache.set(sessionUserId, optimisticBooks);
      setState((previous) => ({
        ...previous,
        books: optimisticBooks,
        cancellingId: bookId,
        cancelError: null,
      }));
      try {
        await books.cancelListing(bookId, sessionUserId);
        if (active.current) {
          setState((previous) => {
            const nextBooks = previous.books.filter((b) => b.id !== bookId);
            if (!isTest && sessionUserId) sessionMyListingsCache.set(sessionUserId, nextBooks);
            return {
              ...previous,
              cancellingId: null,
              books: nextBooks,
            };
          });
        }
        return true;
      } catch (error) {
        if (!isTest && sessionUserId) sessionMyListingsCache.set(sessionUserId, previousBooks);
        if (active.current) {
          setState((previous) => ({
            ...previous,
            books: previousBooks,
            cancellingId: null,
            cancelError:
              error instanceof DomainError
                ? error.message
                : "Não foi possível remover o anúncio. Tente novamente.",
          }));
        }
        return false;
      }
    },
    [books, sessionUserId, isTest],
  );

  const togglePauseListing = useCallback(
    async (bookId: string): Promise<boolean> => {
      const previousBooks = booksRef.current;
      const target = previousBooks.find((b) => b.id === bookId);
      const canOptimisticallyFlip =
        target !== undefined && (target.status === "available" || target.status === "paused");
      const optimisticBooks = canOptimisticallyFlip
        ? previousBooks.map((b) =>
            b.id === bookId
              ? { ...b, status: (b.status === "paused" ? "available" : "paused") as Book["status"] }
              : b,
          )
        : previousBooks;
      if (canOptimisticallyFlip && !isTest && sessionUserId) {
        sessionMyListingsCache.set(sessionUserId, optimisticBooks);
      }
      setState((previous) => ({
        ...previous,
        books: optimisticBooks,
        pausingId: bookId,
        pauseError: null,
      }));
      try {
        const updated = await books.togglePauseListing(bookId, sessionUserId);
        if (active.current) {
          setState((previous) => {
            const nextBooks = previous.books.map((b) => (b.id === bookId ? updated : b));
            if (!isTest && sessionUserId) sessionMyListingsCache.set(sessionUserId, nextBooks);
            return {
              ...previous,
              pausingId: null,
              books: nextBooks,
            };
          });
        }
        return true;
      } catch (error) {
        if (canOptimisticallyFlip && !isTest && sessionUserId) {
          sessionMyListingsCache.set(sessionUserId, previousBooks);
        }
        if (active.current) {
          setState((previous) => ({
            ...previous,
            books: previousBooks,
            pausingId: null,
            pauseError:
              error instanceof DomainError
                ? error.message
                : "Não foi possível alterar o status do anúncio. Tente novamente.",
          }));
        }
        return false;
      }
    },
    [books, sessionUserId, isTest],
  );

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload, cancelListing, togglePauseListing }];
}
