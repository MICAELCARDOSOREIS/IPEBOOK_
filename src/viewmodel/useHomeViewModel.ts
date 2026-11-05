import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type HomeState = {
  books: readonly Book[];
  loading: boolean;
  error: string | null;
};

export type HomeActions = {
  reload: () => Promise<void>;
};

export function useHomeViewModel(books: IBookUseCases): [HomeState, HomeActions] {
  const [state, setState] = useState<HomeState>({
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
      const result = await books.listBooks();
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
              : "Não foi possível carregar os livros. Tente novamente.",
        }));
      }
    }
  }, [books]);

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
