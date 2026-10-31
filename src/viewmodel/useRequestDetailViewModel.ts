import { useCallback, useEffect, useRef, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases, NegotiationDetail } from "@/usecase/iBookRequestUseCases";

export type RequestDetailState = {
  detail: NegotiationDetail | null;
  loading: boolean;
  error: string | null;
};

export type RequestDetailActions = {
  reload: () => Promise<void>;
  respond?: (response: "accept" | "reject") => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar os detalhes da negociação. Tente novamente.";

export function useRequestDetailViewModel(
  requestId: string,
  sessionUserId: string | null,
  useCases: IBookRequestUseCases = bookRequestUseCases,
): [RequestDetailState, RequestDetailActions] {
  const [state, setState] = useState<RequestDetailState>({
    detail: null,
    loading: true,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const detail = await useCases.getRequestDetail(requestId, sessionUserId);
      if (active.current && current === request.current) {
        setState({ detail, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState({
          detail: null,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        });
      }
    }
  }, [useCases, requestId, sessionUserId]);

  const respond = useCallback(
    async (response: "accept" | "reject") => {
      if (!sessionUserId) return;
      await useCases.respondToRequest(requestId, response, sessionUserId);
      await reload();
    },
    [useCases, requestId, sessionUserId, reload],
  );

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload, respond }];
}
