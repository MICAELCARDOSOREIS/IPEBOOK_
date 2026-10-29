import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases, RequestWithListing } from "@/usecase/iBookRequestUseCases";

export type { RequestWithListing };

export type RequestListState = {
  items: readonly RequestWithListing[];
  loading: boolean;
  error: string | null;
};

const LOAD_ERROR = "Não foi possível carregar os pedidos. Tente novamente.";

export function messageOf(error: unknown, fallback: string): string {
  return error instanceof DomainError ? error.message : fallback;
}

/**
 * Base compartilhada pelas listas de pedidos recebidos e enviados: carrega, descarta
 * respostas antigas (condição de corrida) e ignora atualizações após desmontar.
 */
export function useRequestList(
  load: () => Promise<readonly RequestWithListing[]>,
): [RequestListState, () => Promise<void>, MutableRefObject<boolean>] {
  const [state, setState] = useState<RequestListState>({ items: [], loading: true, error: null });
  const active = useRef(false);
  const generation = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++generation.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const items = await load();
      if (active.current && current === generation.current) {
        setState({ items, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === generation.current) {
        setState((prev) => ({ ...prev, loading: false, error: messageOf(error, LOAD_ERROR) }));
      }
    }
  }, [load]);

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
  useCases: IBookRequestUseCases = bookRequestUseCases,
): [RequestListState, { reload: () => Promise<void> }] {
  const load = useCallback(() => useCases.listSentRequests(sessionUserId), [useCases, sessionUserId]);
  const [state, reload] = useRequestList(load);
  return [state, { reload }];
}
