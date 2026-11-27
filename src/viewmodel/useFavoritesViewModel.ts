import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import { notifyFavoriteChanged, registerSessionMemoryCache } from "@/viewmodel/sessionCacheRegistry";
import { useAppForegroundRefresh } from "@/viewmodel/useRealtimeSync";

export type FavoritesState = {
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  removingId: string | null;
  /** Falha de uma ação da lista; não substitui o conteúdo já carregado. */
  actionError: string | null;
};
export type FavoritesActions = {
  reload: () => Promise<void>;
  /** Desfavorita na própria lista, como o coração da linha no Figma `02.06`. */
  removeFavorite: (bookId: string) => Promise<boolean>;
  clearActionError: () => void;
};

const sessionFavoritesCache = new Map<string, readonly Book[]>();

registerSessionMemoryCache(() => {
  sessionFavoritesCache.clear();
});

export function useFavoritesViewModel(userId: string | null, useCases: IFavoriteUseCases): [FavoritesState, FavoritesActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached = !isTest && userId ? (sessionFavoritesCache.get(userId) ?? null) : null;
  const [state, setState] = useState<FavoritesState>({
    books: initialCached ?? [],
    loading: Boolean(userId) && initialCached === null,
    error: null,
    removingId: null,
    actionError: null,
  });
  const booksRef = useRef<readonly Book[]>(state.books);
  booksRef.current = state.books;
  const reload = useCallback(async () => {
    if (!userId) { setState({ books: [], loading: false, error: null, removingId: null, actionError: null }); return; }
    setState((prev) => ({ ...prev, loading: prev.books.length === 0, error: null }));
    try {
      const books = await useCases.listFavorites(userId);
      if (!isTest) sessionFavoritesCache.set(userId, books);
      setState({ books, loading: false, error: null, removingId: null, actionError: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          prev.books.length > 0
            ? null
            : error instanceof DomainError
              ? error.message
              : "Não foi possível carregar favoritos.",
        removingId: null,
      }));
    }
  }, [userId, useCases, isTest]);
  const removeFavorite = useCallback(async (bookId: string) => {
    if (!userId) return false;
    const previousBooks = booksRef.current;
    const optimisticBooks = previousBooks.filter((book) => book.id !== bookId);
    if (!isTest) sessionFavoritesCache.set(userId, optimisticBooks);
    setState((prev) => ({
      ...prev,
      books: optimisticBooks,
      removingId: bookId,
      actionError: null,
    }));
    try {
      await useCases.toggleFavorite(userId, bookId);
      notifyFavoriteChanged(userId, bookId, false);
      setState((prev) => ({
        ...prev,
        removingId: null,
      }));
      return true;
    } catch (error) {
      if (!isTest) sessionFavoritesCache.set(userId, previousBooks);
      notifyFavoriteChanged(userId, bookId, true);
      setState((prev) => ({
        ...prev,
        books: previousBooks,
        removingId: null,
        actionError: error instanceof DomainError ? error.message : "Não foi possível atualizar o favorito.",
      }));
      return false;
    }
  }, [userId, useCases, isTest]);

  const clearActionError = useCallback(() => {
    setState((prev) => ({ ...prev, actionError: null }));
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  useAppForegroundRefresh(() => { void reload(); }, Boolean(userId));
  return [state, { reload, removeFavorite, clearActionError }];
}
