import { useCallback, useEffect, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

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

export function useFavoritesViewModel(userId: string | null, useCases: IFavoriteUseCases): [FavoritesState, FavoritesActions] {
  const [state, setState] = useState<FavoritesState>({
    books: [],
    loading: Boolean(userId),
    error: null,
    removingId: null,
    actionError: null,
  });
  const reload = useCallback(async () => {
    if (!userId) { setState({ books: [], loading: false, error: null, removingId: null, actionError: null }); return; }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const books = await useCases.listFavorites(userId);
      setState({ books, loading: false, error: null, removingId: null, actionError: null });
    } catch (error) {
      setState({
        books: [],
        loading: false,
        error: error instanceof DomainError ? error.message : "Não foi possível carregar favoritos.",
        removingId: null,
        actionError: null,
      });
    }
  }, [userId, useCases]);
  const removeFavorite = useCallback(async (bookId: string) => {
    if (!userId) return false;
    setState((prev) => ({ ...prev, removingId: bookId, actionError: null }));
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
        actionError: error instanceof DomainError ? error.message : "Não foi possível atualizar o favorito.",
      }));
      return false;
    }
  }, [userId, useCases]);

  const clearActionError = useCallback(() => {
    setState((prev) => ({ ...prev, actionError: null }));
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return [state, { reload, removeFavorite, clearActionError }];
}
