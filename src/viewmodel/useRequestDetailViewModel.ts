import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases, NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import { useAppForegroundRefresh, useDebouncedRealtimeCallback } from "@/viewmodel/useRealtimeSync";

export type RequestDetailState = {
  detail: NegotiationDetail | null;
  loading: boolean;
  error: string | null;
};

export type RequestDetailActions = {
  reload: () => Promise<void>;
  /** Recarrega silenciosamente sem piscar o esqueleto de carregamento. */
  refresh?: () => Promise<void>;
  respond?: (response: "accept" | "reject") => Promise<void>;
  cancelRequest?: () => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar os detalhes da negociação. Tente novamente.";
const PENDING_SAFETY_POLL_MS = 8_000;

export function useRequestDetailViewModel(
  requestId: string,
  sessionUserId: string | null,
  useCases: IBookRequestUseCases,
  subscribe?: (requestId: string, sessionUserId: string, onChange: () => void) => () => void,
): [RequestDetailState, RequestDetailActions] {
  const [state, setState] = useState<RequestDetailState>({
    detail: null,
    loading: true,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      if (!active.current) return;
      const current = ++request.current;
      if (!silent) {
        setState((previous) => ({ ...previous, loading: previous.detail === null, error: null }));
      }
      try {
        const detail = await useCases.getRequestDetail(requestId, sessionUserId);
        if (active.current && current === request.current) {
          setState({ detail, loading: false, error: null });
        }
      } catch (error) {
        if (active.current && current === request.current && !silent) {
          setState({
            detail: null,
            loading: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    },
    [useCases, requestId, sessionUserId],
  );

  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);
  const debouncedRefresh = useDebouncedRealtimeCallback(() => {
    void refresh();
  });

  const respond = useCallback(
    async (response: "accept" | "reject") => {
      if (!sessionUserId) return;
      await useCases.respondToRequest(requestId, response, sessionUserId);
      await refresh();
    },
    [useCases, requestId, sessionUserId, refresh],
  );

  const cancelRequest = useCallback(async () => {
    if (!sessionUserId) return;
    await useCases.cancelRequest(requestId, sessionUserId);
    await refresh();
  }, [useCases, requestId, sessionUserId, refresh]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  useEffect(() => {
    if (!requestId || !sessionUserId || !subscribe) return;
    return subscribe(requestId, sessionUserId, debouncedRefresh);
  }, [requestId, sessionUserId, subscribe, debouncedRefresh]);

  useAppForegroundRefresh(() => {
    void refresh();
  }, Boolean(requestId && sessionUserId));

  // Enquanto o pedido está pendente, checa periodicamente em primeiro plano caso o WebSocket caia.
  const isPending = state.detail?.request.status === "pending";
  useEffect(() => {
    if (process.env.NODE_ENV === "test" || !isPending || !requestId || !sessionUserId) return;
    const timer = setInterval(() => {
      if (AppState.currentState && AppState.currentState !== "active") return;
      void refresh();
    }, PENDING_SAFETY_POLL_MS);
    return () => clearInterval(timer);
  }, [isPending, requestId, sessionUserId, refresh]);

  return [state, { reload, refresh, respond, cancelRequest }];
}
