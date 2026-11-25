import { useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";

export type FavoriteButtonState = { selected: boolean; loading: boolean; error: string | null };
export type FavoriteButtonActions = { toggle: () => Promise<boolean> };

export function useFavoriteButtonViewModel(bookId: string, userId: string | null, useCases: IFavoriteUseCases): [FavoriteButtonState, FavoriteButtonActions] {
  const [state, setState] = useState<FavoriteButtonState>({ selected: false, loading: false, error: null });
  const selectedRef = useRef(false);
  selectedRef.current = state.selected;
  const active = useRef(true);
  const toggleSeq = useRef(0);

  useEffect(() => {
    active.current = true;
    if (!userId) { setState({ selected: false, loading: false, error: null }); return () => { active.current = false; }; }
    let current = true;
    const seqAtLoad = toggleSeq.current;
    void useCases.isFavorite(userId, bookId).then((selected) => {
      if (current && toggleSeq.current === seqAtLoad) setState({ selected, loading: false, error: null });
    }).catch(() => { if (current && toggleSeq.current === seqAtLoad) setState((prev) => ({ ...prev, error: "Não foi possível consultar favoritos." })); });
    return () => { current = false; active.current = false; };
  }, [userId, bookId, useCases]);

  const toggle = useCallback(async (): Promise<boolean> => {
    const seq = ++toggleSeq.current;
    const previousSelected = selectedRef.current;
    const optimisticSelected = userId ? !previousSelected : previousSelected;
    // Caminho feliz otimista: atualiza o coração na hora e persiste no banco em segundo plano.
    setState({ selected: optimisticSelected, loading: true, error: null });
    try {
      const selected = await useCases.toggleFavorite(userId, bookId);
      if (active.current && toggleSeq.current === seq) {
        setState({ selected, loading: false, error: null });
      }
      return true;
    } catch (error) {
      if (active.current && toggleSeq.current === seq) {
        setState({
          selected: previousSelected,
          loading: false,
          error: error instanceof DomainError ? error.message : "Não foi possível atualizar favorito.",
        });
      }
      return false;
    }
  }, [userId, bookId, useCases]);
  return [state, { toggle }];
}
