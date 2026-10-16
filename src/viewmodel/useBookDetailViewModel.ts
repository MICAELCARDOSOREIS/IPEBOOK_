import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import { favoriteUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export type BookDetailState = {
  book: Book | null;
  loading: boolean;
  error: string | null;
  isFavorite: boolean;
  favoriteError: string | null;
  favoriteLoading: boolean;
};

export type BookDetailActions = {
  reload: () => Promise<void>;
  toggleFavorite: (userId: string | null) => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar o anúncio. Tente novamente.";

export function useBookDetailViewModel(
  bookId: string,
  useCases: IBookUseCases = bookUseCases,
  favorites: IFavoriteUseCases = favoriteUseCases,
  userId: string | null = null,
): [BookDetailState, BookDetailActions] {
  const [state, setState] = useState<BookDetailState>({ book: null, loading: true, error: null, isFavorite: false, favoriteError: null, favoriteLoading: false });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const book = await useCases.getBookById(bookId);
      let isFavorite = false;
      let favoriteError: string | null = null;
      if (userId) {
        try {
          isFavorite = await favorites.isFavorite(userId, bookId);
        } catch {
          favoriteError = "Não foi possível consultar favoritos.";
        }
      }
      if (active.current && current === request.current) {
        setState((prev) => ({ ...prev, book, isFavorite, favoriteError, loading: false, error: null }));
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState((prev) => ({ ...prev,
          book: null,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
    }
  }, [useCases, bookId, favorites, userId]);

  const toggleFavorite = useCallback(async (sessionUserId: string | null) => {
    setState((prev) => ({ ...prev, favoriteLoading: true, favoriteError: null }));
    try {
      const isFavorite = await favorites.toggleFavorite(sessionUserId, bookId);
      setState((prev) => ({ ...prev, isFavorite, favoriteLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, favoriteLoading: false, favoriteError: error instanceof DomainError ? error.message : "Não foi possível atualizar favorito." }));
    }
  }, [favorites, bookId]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload, toggleFavorite }];
}
