import { useCallback, useRef, useState } from "react";
import { bookRequestUseCases } from "@/di/container";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";

export type ChatWithUserDeps = {
  listSentRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
  listReceivedRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
};

const defaultDeps: ChatWithUserDeps = {
  listSentRequests: (id) => bookRequestUseCases.listSentRequests(id),
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
};

export const NO_CONVERSATION_MESSAGE =
  "Ainda não há conversa com essa pessoa. O chat abre quando uma negociação é aceita: peça um dos livros dela para começar.";
const LOAD_ERROR = "Não foi possível abrir a conversa. Tente novamente.";

/** Negociação aceita entre a pessoa logada e `userId`, a mais recente primeiro na lista recebida. */
export function findAcceptedRequestWith(
  userId: string,
  sent: readonly RequestWithListing[],
  received: readonly RequestWithListing[],
): string | null {
  const fromSent = sent.find((e) => e.request.status === "accepted" && e.listing.ownerId === userId);
  if (fromSent) return fromSent.request.id;
  const fromReceived = received.find((e) => e.request.status === "accepted" && e.request.requesterId === userId);
  return fromReceived?.request.id ?? null;
}

/**
 * "Conversar" no perfil público (Spec 091): o chat pertence a uma negociação aceita, então abre a
 * conversa existente com a pessoa ou explica como começar uma. Ignora toque repetido enquanto busca.
 */
export function useChatWithUser(
  sessionUserId: string | null,
  userId: string,
  onOpenChat: (requestId: string) => void,
  deps: ChatWithUserDeps = defaultDeps,
): { busy: boolean; notice: string | null; start: () => Promise<void> } {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const running = useRef(false);

  const start = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const [sent, received] = await Promise.all([deps.listSentRequests(sessionUserId), deps.listReceivedRequests(sessionUserId)]);
      const requestId = findAcceptedRequestWith(userId, sent, received);
      if (requestId) onOpenChat(requestId);
      else setNotice(NO_CONVERSATION_MESSAGE);
    } catch {
      setNotice(LOAD_ERROR);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, [sessionUserId, userId, onOpenChat, deps]);

  return { busy, notice, start };
}
