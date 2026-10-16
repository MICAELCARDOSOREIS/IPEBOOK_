import { useCallback, useEffect, useState } from "react";
import { favoriteUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export type FavoriteButtonState = { selected: boolean; loading: boolean; error: string | null };
export type FavoriteButtonActions = { toggle: () => Promise<void> };

export function useFavoriteButtonViewModel(bookId: string, userId: string | null, useCases: IFavoriteUseCases = favoriteUseCases): [FavoriteButtonState, FavoriteButtonActions] {
  const [state, setState] = useState<FavoriteButtonState>({ selected: false, loading: false, error: null });
  useEffect(() => {
    if (!userId) { setState({ selected: false, loading: false, error: null }); return; }
    let active = true;
    void useCases.isFavorite(userId, bookId).then((selected) => {
      if (active) setState({ selected, loading: false, error: null });
    }).catch(() => { if (active) setState((prev) => ({ ...prev, error: "Não foi possível consultar favoritos." })); });
    return () => { active = false; };
  }, [userId, bookId, useCases]);
  const toggle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const selected = await useCases.toggleFavorite(userId, bookId);
      setState({ selected, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error instanceof DomainError ? error.message : "Não foi possível atualizar favorito." }));
    }
  }, [userId, bookId, useCases]);
  return [state, { toggle }];
}
