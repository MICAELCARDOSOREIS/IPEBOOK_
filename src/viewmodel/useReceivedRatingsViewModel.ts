import { useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IRatingUseCases, ReceivedRating } from "@/usecase/iRatingUseCases";
import { registerSessionMemoryCache } from "@/viewmodel/sessionCacheRegistry";
import { useAppForegroundRefresh, useDebouncedRealtimeCallback } from "@/viewmodel/useRealtimeSync";

export type ReceivedRatingsState = {
  ratings: readonly ReceivedRating[];
  loading: boolean;
  error: string | null;
};

export type ReceivedRatingsActions = {
  reload: () => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar suas avaliações. Tente novamente.";
const sessionRatingsCache = new Map<string, readonly ReceivedRating[]>();

registerSessionMemoryCache(() => {
  sessionRatingsCache.clear();
});

export function useReceivedRatingsViewModel(
  sessionUserId: string | null,
  useCases: IRatingUseCases,
  subscribe?: (sessionUserId: string, onChange: () => void) => () => void,
): [ReceivedRatingsState, ReceivedRatingsActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached =
    !isTest && sessionUserId ? (sessionRatingsCache.get(sessionUserId) ?? null) : null;
  const [state, setState] = useState<ReceivedRatingsState>({
    ratings: initialCached ?? [],
    loading: initialCached === null,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({
      ...previous,
      loading: previous.ratings.length === 0 && (!sessionUserId || !sessionRatingsCache.has(sessionUserId)),
      error: null,
    }));
    try {
      const ratings = await useCases.listReceivedRatings(sessionUserId);
      if (!isTest && sessionUserId) sessionRatingsCache.set(sessionUserId, ratings);
      if (active.current && current === request.current) {
        setState({ ratings, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            previous.ratings.length > 0
              ? null
              : error instanceof DomainError
                ? error.message
                : GENERIC_ERROR,
        }));
      }
    }
  }, [useCases, sessionUserId, isTest]);

  const debouncedReload = useDebouncedRealtimeCallback(() => {
    void reload();
  }, 200);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  useEffect(() => {
    if (!sessionUserId || !subscribe) return;
    return subscribe(sessionUserId, debouncedReload);
  }, [sessionUserId, subscribe, debouncedReload]);

  useAppForegroundRefresh(() => {
    void reload();
  }, Boolean(sessionUserId));

  return [state, { reload }];
}
