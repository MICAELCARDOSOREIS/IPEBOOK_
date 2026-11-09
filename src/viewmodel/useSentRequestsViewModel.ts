import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases, RequestWithListing } from "@/usecase/iBookRequestUseCases";

export type { RequestWithListing };

export type ListState<T> = {
  items: readonly T[];
  loading: boolean;
  error: string | null;
};

export type RequestListState = ListState<RequestWithListing>;

const LOAD_ERROR = "Não foi possível carregar os pedidos. Tente novamente.";
const sessionRequestListCache = new Map<string, readonly unknown[]>();

export function messageOf(error: unknown, fallback: string): string {
  return error instanceof DomainError ? error.message : fallback;
}

/**
 * Base compartilhada pelas listas de pedidos recebidos e enviados: carrega, descarta
 * respostas antigas (condição de corrida) e ignora atualizações após desmontar.
 */
export function useRequestList<T = RequestWithListing>(
  load: () => Promise<readonly T[]>,
  loadError: string = LOAD_ERROR,
  cacheKey?: string,
): [ListState<T>, () => Promise<void>, MutableRefObject<boolean>] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached =
    !isTest && cacheKey ? ((sessionRequestListCache.get(cacheKey) as readonly T[] | undefined) ?? null) : null;
  const [state, setState] = useState<ListState<T>>({
    items: initialCached ?? [],
    loading: initialCached === null,
    error: null,
  });
  const active = useRef(false);
  const generation = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++generation.current;
    setState((prev) => ({ ...prev, loading: prev.items.length === 0, error: null }));
    try {
      const items = await load();
      if (!isTest && cacheKey) sessionRequestListCache.set(cacheKey, items);
      if (active.current && current === generation.current) {
        setState({ items, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === generation.current) {
        setState((prev) => ({ ...prev, loading: false, error: messageOf(error, loadError) }));
      }
    }
  }, [load, loadError, isTest, cacheKey]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      generation.current += 1;
    };
  }, [reload]);

  return [state, reload, active];
}

export function useSentRequestsViewModel(
  sessionUserId: string | null,
  useCases: IBookRequestUseCases,
): [RequestListState, { reload: () => Promise<void> }] {
  const load = useCallback(() => useCases.listSentRequests(sessionUserId), [useCases, sessionUserId]);
  const [state, reload] = useRequestList(
    load,
    LOAD_ERROR,
    sessionUserId ? `sent:${sessionUserId}` : undefined,
  );
  return [state, { reload }];
}
