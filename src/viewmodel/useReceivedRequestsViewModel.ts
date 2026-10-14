import { useCallback, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import type { IBookRequestUseCases, RequestResponse } from "@/usecase/iBookRequestUseCases";
import { messageOf, type RequestListState, useRequestList } from "@/viewmodel/useSentRequestsViewModel";

export type ReceivedRequestsState = RequestListState & {
  respondingId: string | null;
  respondError: string | null;
  respondErrorId: string | null;
};

export type ReceivedRequestsActions = {
  reload: () => Promise<void>;
  accept: (requestId: string) => Promise<boolean>;
  reject: (requestId: string) => Promise<boolean>;
};

const RESPOND_ERROR = "Não foi possível responder ao pedido. Tente novamente.";

export function useReceivedRequestsViewModel(
  sessionUserId: string | null,
  useCases: IBookRequestUseCases = bookRequestUseCases,
): [ReceivedRequestsState, ReceivedRequestsActions] {
  const load = useCallback(() => useCases.listReceivedRequests(sessionUserId), [useCases, sessionUserId]);
  const [listState, reload, active] = useRequestList(load);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<{ id: string; message: string } | null>(null);

  const respond = useCallback(
    async (requestId: string, response: RequestResponse) => {
      setRespondingId(requestId);
      setRespondError(null);
      try {
        await useCases.respondToRequest(requestId, response, sessionUserId);
        if (active.current) setRespondingId(null);
        await reload();
        return true;
      } catch (error) {
        if (active.current) {
          setRespondingId(null);
          setRespondError({ id: requestId, message: messageOf(error, RESPOND_ERROR) });
        }
        return false;
      }
    },
    [useCases, sessionUserId, reload, active],
  );

  const accept = useCallback((id: string) => respond(id, "accept"), [respond]);
  const reject = useCallback((id: string) => respond(id, "reject"), [respond]);

  return [
    {
      ...listState,
      respondingId,
      respondError: respondError?.message ?? null,
      respondErrorId: respondError?.id ?? null,
    },
    { reload, accept, reject },
  ];
}
