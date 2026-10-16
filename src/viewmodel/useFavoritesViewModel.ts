import { useCallback, useEffect, useState } from "react";
import { favoriteUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export type FavoritesState = { books: readonly Book[]; loading: boolean; error: string | null };
export type FavoritesActions = { reload: () => Promise<void> };

export function useFavoritesViewModel(userId: string | null, useCases: IFavoriteUseCases = favoriteUseCases): [FavoritesState, FavoritesActions] {
  const [state, setState] = useState<FavoritesState>({ books: [], loading: Boolean(userId), error: null });
  const reload = useCallback(async () => {
    if (!userId) { setState({ books: [], loading: false, error: null }); return; }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const books = await useCases.listFavorites(userId);
      setState({ books, loading: false, error: null });
    } catch (error) {
      setState({ books: [], loading: false, error: error instanceof DomainError ? error.message : "Não foi possível carregar favoritos." });
    }
  }, [userId, useCases]);
  useEffect(() => { void reload(); }, [reload]);
  return [state, { reload }];
}
