import { useCallback, useEffect, useRef, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";

export type RequestNegotiationState = {
  pendingListingId: string | null;
  requestedListingIds: readonly string[];
  error: string | null;
  errorListingId: string | null;
};

export type RequestNegotiationActions = {
  request: (listingId: string, sessionUserId: string | null) => Promise<boolean>;
};

const GENERIC_ERROR = "Não foi possível solicitar a negociação. Tente novamente.";

export function useRequestNegotiationViewModel(
  useCases: IBookRequestUseCases = bookRequestUseCases,
): [RequestNegotiationState, RequestNegotiationActions] {
  const [state, setState] = useState<RequestNegotiationState>({
    pendingListingId: null,
    requestedListingIds: [],
    error: null,
    errorListingId: null,
  });
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const request = useCallback(
    async (listingId: string, sessionUserId: string | null) => {
      setState((prev) => ({ ...prev, pendingListingId: listingId, error: null, errorListingId: null }));
      try {
        await useCases.requestNegotiation(listingId, sessionUserId);
        if (active.current) {
          setState((prev) => ({
            ...prev,
            pendingListingId: null,
            requestedListingIds: [...prev.requestedListingIds, listingId],
          }));
        }
        return true;
      } catch (error) {
        if (active.current) {
          setState((prev) => ({
            ...prev,
            pendingListingId: null,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
            errorListingId: listingId,
          }));
        }
        return false;
      }
    },
    [useCases],
  );

  return [state, { request }];
}
