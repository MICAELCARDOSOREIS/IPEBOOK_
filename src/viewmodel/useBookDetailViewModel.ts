import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type BookDetailState = {
  book: Book | null;
  loading: boolean;
  error: string | null;
};

export type BookDetailActions = {
  reload: () => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar o anúncio. Tente novamente.";

export function useBookDetailViewModel(
  bookId: string,
  useCases: IBookUseCases = bookUseCases,
): [BookDetailState, BookDetailActions] {
  const [state, setState] = useState<BookDetailState>({ book: null, loading: true, error: null });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const book = await useCases.getBookById(bookId);
      if (active.current && current === request.current) {
        setState({ book, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState({
          book: null,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        });
      }
    }
  }, [useCases, bookId]);

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
