import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import { getCachedCatalogBookById } from "@/viewmodel/useHomeViewModel";
import { getCachedMyListingById } from "@/viewmodel/useMyListingsViewModel";

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
const sessionBookDetailCache = new Map<string, Book>();

export function useBookDetailViewModel(
  bookId: string,
  useCases: IBookUseCases,
  favorites: IFavoriteUseCases,
  userId: string | null = null,
): [BookDetailState, BookDetailActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialBook = !isTest
    ? (sessionBookDetailCache.get(bookId) ??
      getCachedCatalogBookById(bookId) ??
      getCachedMyListingById(bookId))
    : null;
  const [state, setState] = useState<BookDetailState>({
    book: initialBook,
    loading: initialBook === null,
    error: null,
    isFavorite: false,
    favoriteError: null,
    favoriteLoading: false,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: previous.book === null, error: null }));
    try {
      const favoritePromise = userId
        ? favorites.isFavorite(userId, bookId).then(
            (val) => ({ isFavorite: val, favoriteError: null as string | null }),
            () => ({ isFavorite: false, favoriteError: "Não foi possível consultar favoritos." }),
          )
        : Promise.resolve({ isFavorite: false, favoriteError: null as string | null });

      const [book, { isFavorite, favoriteError }] = await Promise.all([
        useCases.getBookById(bookId),
        favoritePromise,
      ]);
      if (!isTest) sessionBookDetailCache.set(bookId, book);
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
  }, [useCases, bookId, favorites, userId, isTest]);

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
