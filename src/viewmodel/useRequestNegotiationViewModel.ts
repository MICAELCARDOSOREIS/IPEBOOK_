import { useCallback, useEffect, useRef, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";
import { DomainError, ValidationError } from "@/model/errors";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";

export type RequestNegotiationState = {
  pendingListingId: string | null;
  requestedListingIds: readonly string[];
  error: string | null;
  errorListingId: string | null;
  activeRequestId: string | null;
  activeRequestStatus: RequestStatus | null;
  loadingActiveRequest: boolean;
};

export type RequestNegotiationActions = {
  checkActiveRequest: (listingId: string, sessionUserId: string | null) => Promise<BookRequest | null>;
  request: (listingId: string, sessionUserId: string | null) => Promise<BookRequest | null>;
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
    activeRequestId: null,
    activeRequestStatus: null,
    loadingActiveRequest: false,
  });
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const checkActiveRequest = useCallback(
    async (listingId: string, sessionUserId: string | null) => {
      if (!sessionUserId) {
        if (active.current) {
          setState((prev) => ({
            ...prev,
            activeRequestId: null,
            activeRequestStatus: null,
            loadingActiveRequest: false,
          }));
        }
        return null;
      }
      if (active.current) {
        setState((prev) => ({ ...prev, loadingActiveRequest: true }));
      }
      try {
        const found = await useCases.getActiveRequest?.(listingId, sessionUserId) ?? null;
        if (active.current) {
          setState((prev) => ({
            ...prev,
            loadingActiveRequest: false,
            activeRequestId: found ? found.id : null,
            activeRequestStatus: found ? found.status : null,
            requestedListingIds:
              found && !prev.requestedListingIds.includes(listingId)
                ? [...prev.requestedListingIds, listingId]
                : prev.requestedListingIds,
          }));
        }
        return found;
      } catch {
        if (active.current) {
          setState((prev) => ({ ...prev, loadingActiveRequest: false }));
        }
        return null;
      }
    },
    [useCases],
  );

  const request = useCallback(
    async (listingId: string, sessionUserId: string | null) => {
      setState((prev) => ({ ...prev, pendingListingId: listingId, error: null, errorListingId: null }));
      try {
        const created = await useCases.requestNegotiation(listingId, sessionUserId);
        if (active.current) {
          setState((prev) => ({
            ...prev,
            pendingListingId: null,
            activeRequestId: created.id,
            activeRequestStatus: created.status,
            requestedListingIds: prev.requestedListingIds.includes(listingId)
              ? prev.requestedListingIds
              : [...prev.requestedListingIds, listingId],
          }));
        }
        return created;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error ?? "");
        const isAlreadyPending =
          errorMsg.includes("já tem um pedido pendente") ||
          errorMsg.includes("pedido pendente") ||
          errorMsg.includes("unique_pending");

        if (isAlreadyPending) {
          let found: BookRequest | null = null;
          try {
            found = (await useCases.getActiveRequest?.(listingId, sessionUserId)) ?? null;
          } catch {
            // falha na consulta não impede de prosseguir
          }
          const effectiveId = found?.id ?? "";
          const effectiveStatus = found?.status ?? "pending";
          if (active.current) {
            setState((prev) => ({
              ...prev,
              pendingListingId: null,
              error: null,
              errorListingId: null,
              activeRequestId: effectiveId || prev.activeRequestId,
              activeRequestStatus: effectiveStatus,
              requestedListingIds: prev.requestedListingIds.includes(listingId)
                ? prev.requestedListingIds
                : [...prev.requestedListingIds, listingId],
            }));
          }
          return found ?? ({ id: effectiveId, listingId, requesterId: sessionUserId ?? "", status: effectiveStatus } as BookRequest);
        }

        if (active.current) {
          setState((prev) => ({
            ...prev,
            pendingListingId: null,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
            errorListingId: listingId,
          }));
        }
        return null;
      }
    },
    [useCases],
  );

  return [state, { checkActiveRequest, request }];
}
