import { useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IRatingUseCases, ReceivedRating } from "@/usecase/iRatingUseCases";

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

export function useReceivedRatingsViewModel(
  sessionUserId: string | null,
  useCases: IRatingUseCases,
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
        setState({
          ratings: [],
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        });
      }
    }
  }, [useCases, sessionUserId, isTest]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload }];
}
