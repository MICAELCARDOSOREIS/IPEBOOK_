import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type MyListingsState = {
  books: readonly Book[];
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

export function getCachedMyListingById(bookId: string): Book | null {
  if (process.env.NODE_ENV === "test") return null;
  for (const list of sessionMyListingsCache.values()) {
    const found = list.find((b) => b.id === bookId);
    if (found) return found;
  }
  return null;
}

export function useMyListingsViewModel(
  sessionUserId: string | null,
  books: IBookUseCases,
): [MyListingsState, MyListingsActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached = !isTest && sessionUserId ? (sessionMyListingsCache.get(sessionUserId) ?? null) : null;
  const [state, setState] = useState<MyListingsState>({
    books: initialCached ?? [],
    loading: initialCached === null,
    error: null,
    cancellingId: null,
    cancelError: null,
    pausingId: null,
    pauseError: null,
  });
  const active = useRef(false);
  const request = useRef(0);

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
      const result = await books.listMyListings(sessionUserId);
      if (!isTest && sessionUserId) sessionMyListingsCache.set(sessionUserId, result);
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          books: result,
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
      setState((previous) => ({ ...previous, cancellingId: bookId, cancelError: null }));
      try {
        await books.cancelListing(bookId, sessionUserId);
        setState((previous) => ({
          ...previous,
          cancellingId: null,
          books: previous.books.filter((b) => b.id !== bookId),
        }));
        return true;
      } catch (error) {
        setState((previous) => ({
          ...previous,
          cancellingId: null,
          cancelError:
            error instanceof DomainError
              ? error.message
              : "Não foi possível remover o anúncio. Tente novamente.",
        }));
        return false;
      }
    },
    [books, sessionUserId],
  );

  const togglePauseListing = useCallback(
    async (bookId: string): Promise<boolean> => {
      setState((previous) => ({ ...previous, pausingId: bookId, pauseError: null }));
      try {
        const updated = await books.togglePauseListing(bookId, sessionUserId);
        setState((previous) => ({
          ...previous,
          pausingId: null,
          books: previous.books.map((b) => (b.id === bookId ? updated : b)),
        }));
        return true;
      } catch (error) {
        setState((previous) => ({
          ...previous,
          pausingId: null,
          pauseError:
            error instanceof DomainError
              ? error.message
              : "Não foi possível alterar o status do anúncio. Tente novamente.",
        }));
        return false;
      }
    },
    [books, sessionUserId],
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
