import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type MyListingsState = {
  books: readonly Book[];
  loading: boolean;
  error: string | null;
};

export type MyListingsActions = {
  reload: () => Promise<void>;
};

export function useMyListingsViewModel(
  sessionUserId: string | null,
  books: IBookUseCases = bookUseCases,
): [MyListingsState, MyListingsActions] {
  const [state, setState] = useState<MyListingsState>({
    books: [],
    loading: true,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const result = await books.listMyListings(sessionUserId);
      if (active.current && current === request.current) {
        setState({ books: result, loading: false, error: null });
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

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload }];
}
