import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
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

export function useMyListingsViewModel(
  sessionUserId: string | null,
  books: IBookUseCases = bookUseCases,
): [MyListingsState, MyListingsActions] {
  const [state, setState] = useState<MyListingsState>({
    books: [],
    loading: true,
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
    setState((previous) => ({ ...previous, loading: true, error: null, cancelError: null, pauseError: null }));
    try {
      const result = await books.listMyListings(sessionUserId);
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
  }, [books, sessionUserId]);

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
