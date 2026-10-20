import { useCallback, useEffect, useState } from "react";
import { favoriteUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export type FavoritesState = {
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  removingId: string | null;
};
export type FavoritesActions = {
  reload: () => Promise<void>;
  /** Desfavorita na própria lista, como o coração da linha no Figma `02.06`. */
  removeFavorite: (bookId: string) => Promise<boolean>;
};

export function useFavoritesViewModel(userId: string | null, useCases: IFavoriteUseCases = favoriteUseCases): [FavoritesState, FavoritesActions] {
  const [state, setState] = useState<FavoritesState>({
    books: [],
    loading: Boolean(userId),
    error: null,
    removingId: null,
  });
  const reload = useCallback(async () => {
    if (!userId) { setState({ books: [], loading: false, error: null, removingId: null }); return; }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const books = await useCases.listFavorites(userId);
      setState({ books, loading: false, error: null, removingId: null });
    } catch (error) {
      setState({
        books: [],
        loading: false,
        error: error instanceof DomainError ? error.message : "Não foi possível carregar favoritos.",
        removingId: null,
      });
    }
  }, [userId, useCases]);
  const removeFavorite = useCallback(async (bookId: string) => {
    if (!userId) return false;
    setState((prev) => ({ ...prev, removingId: bookId, error: null }));
    try {
      await useCases.toggleFavorite(userId, bookId);
      setState((prev) => ({
        ...prev,
        books: prev.books.filter((book) => book.id !== bookId),
        removingId: null,
      }));
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        removingId: null,
        error: error instanceof DomainError ? error.message : "Não foi possível atualizar o favorito.",
      }));
      return false;
    }
  }, [userId, useCases]);

  useEffect(() => { void reload(); }, [reload]);
  return [state, { reload, removeFavorite }];
}
