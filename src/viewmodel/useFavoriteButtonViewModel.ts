import { useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import {
  notifyFavoriteChanged,
  registerSessionMemoryCache,
  subscribeFavoriteChanged,
} from "@/viewmodel/sessionCacheRegistry";

export type FavoriteButtonState = { selected: boolean; loading: boolean; error: string | null };
export type FavoriteButtonActions = { toggle: () => Promise<boolean> };

const sessionFavoriteStateCache = new Map<string, Map<string, boolean>>();

registerSessionMemoryCache(() => {
  sessionFavoriteStateCache.clear();
});

function getCachedFavoriteState(userId: string | null, bookId: string, isTest: boolean): boolean | undefined {
  if (isTest || !userId) return undefined;
  return sessionFavoriteStateCache.get(userId)?.get(bookId);
}

function setCachedFavoriteState(userId: string | null, bookId: string, selected: boolean, isTest: boolean): void {
  if (isTest || !userId) return;
  let userMap = sessionFavoriteStateCache.get(userId);
  if (!userMap) {
    userMap = new Map<string, boolean>();
    sessionFavoriteStateCache.set(userId, userMap);
  }
  userMap.set(bookId, selected);
}

export function useFavoriteButtonViewModel(bookId: string, userId: string | null, useCases: IFavoriteUseCases): [FavoriteButtonState, FavoriteButtonActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialSelected = getCachedFavoriteState(userId, bookId, isTest) ?? false;
  const [state, setState] = useState<FavoriteButtonState>({ selected: initialSelected, loading: false, error: null });
  const selectedRef = useRef(initialSelected);
  selectedRef.current = state.selected;
  const active = useRef(true);
  const toggleSeq = useRef(0);

  useEffect(() => {
    active.current = true;
    if (!userId) {
      setState((prev) =>
        prev.selected === false && !prev.loading && prev.error === null
          ? prev
          : { selected: false, loading: false, error: null },
      );
      return () => { active.current = false; };
    }
    let current = true;
    const seqAtLoad = toggleSeq.current;
    void useCases.isFavorite(userId, bookId).then((selected) => {
      setCachedFavoriteState(userId, bookId, selected, isTest);
      if (current && toggleSeq.current === seqAtLoad) {
        setState((prev) =>
          prev.selected === selected && !prev.loading && prev.error === null
            ? prev
            : { selected, loading: false, error: null },
        );
      }
    }).catch(() => { if (current && toggleSeq.current === seqAtLoad) setState((prev) => ({ ...prev, error: "Não foi possível consultar favoritos." })); });
    return () => { current = false; active.current = false; };
  }, [userId, bookId, useCases, isTest]);

  useEffect(() => {
    if (!userId) return;
    return subscribeFavoriteChanged((event) => {
      if (event.userId !== userId || event.bookId !== bookId) return;
      setCachedFavoriteState(userId, bookId, event.selected, isTest);
      setState((prev) =>
        prev.selected === event.selected && !prev.loading && prev.error === null
          ? prev
          : { selected: event.selected, loading: false, error: null },
      );
    });
  }, [userId, bookId, isTest]);

  const toggle = useCallback(async (): Promise<boolean> => {
    const seq = ++toggleSeq.current;
    const previousSelected = selectedRef.current;
    const optimisticSelected = userId ? !previousSelected : previousSelected;
    // Caminho feliz otimista: atualiza o coração na hora e persiste no banco em segundo plano.
    setCachedFavoriteState(userId, bookId, optimisticSelected, isTest);
    if (userId) notifyFavoriteChanged(userId, bookId, optimisticSelected);
    setState({ selected: optimisticSelected, loading: true, error: null });
    try {
      const selected = await useCases.toggleFavorite(userId, bookId);
      setCachedFavoriteState(userId, bookId, selected, isTest);
      if (userId) notifyFavoriteChanged(userId, bookId, selected);
      if (active.current && toggleSeq.current === seq) {
        setState({ selected, loading: false, error: null });
      }
      return true;
    } catch (error) {
      setCachedFavoriteState(userId, bookId, previousSelected, isTest);
      if (userId) notifyFavoriteChanged(userId, bookId, previousSelected);
      if (active.current && toggleSeq.current === seq) {
        setState({
          selected: previousSelected,
          loading: false,
          error: error instanceof DomainError ? error.message : "Não foi possível atualizar favorito.",
        });
      }
      return false;
    }
  }, [userId, bookId, useCases, isTest]);
  return [state, { toggle }];
}
