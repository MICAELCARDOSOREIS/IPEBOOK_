import { useCallback } from "react";
import { bookRequestUseCases, negotiationMessageUseCases, publicProfileUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { useRequestList } from "@/viewmodel/useSentRequestsViewModel";

export type ConversationKind = "accepted" | "pendingReceived" | "pendingSent";

export type ConversationItem = Readonly<{
  requestId: string;
  listing: Book;
  otherName: string;
  preview: string;
  /** Horário relativo da última mensagem; `null` quando ainda não há mensagem. */
  time: string | null;
  kind: ConversationKind;
}>;

export type ConversationsState = {
  items: readonly ConversationItem[];
  loading: boolean;
  error: string | null;
};

/** Dependências injetáveis para teste; o padrão usa o container. */
export type ConversationsDeps = {
  listSentRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
  listReceivedRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
  getMessages: (requestId: string, sessionUserId: string) => Promise<NegotiationMessage[]>;
  getProfileName: (userId: string) => Promise<string | null>;
};

const defaultDeps: ConversationsDeps = {
  listSentRequests: (id) => bookRequestUseCases.listSentRequests(id),
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
  getMessages: (requestId, sessionUserId) => negotiationMessageUseCases.getMessages(requestId, sessionUserId),
  getProfileName: async (userId) => (await publicProfileUseCases.getPublicProfile(userId)).name ?? null,
};

const COMMUNITY_MEMBER = "Pessoa da comunidade";
const LOAD_ERROR = "Não foi possível carregar suas conversas. Tente novamente.";
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Horário relativo do Figma `06.01`: "agora", "10 min", "9h", "Ontem", dia da semana ou data. */
export function formatConversationTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= startOfToday) return `${Math.floor(minutes / 60)}h`;
  const days = Math.ceil((startOfToday.getTime() - date.getTime()) / 86_400_000);
  if (days <= 1) return "Ontem";
  if (days < 7) return WEEKDAYS[date.getDay()];
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function safely<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

async function buildItem(
  entry: RequestWithListing,
  sessionUserId: string,
  sent: boolean,
  deps: ConversationsDeps,
): Promise<{ item: ConversationItem; sortKey: string }> {
  const { request, listing } = entry;
  const otherName =
    (sent ? await safely(deps.getProfileName(listing.ownerId), null) : entry.requesterName) || COMMUNITY_MEMBER;
  const base = { requestId: request.id, listing, otherName };

  if (request.status === "pending") {
    return {
      item: { ...base, kind: sent ? "pendingSent" : "pendingReceived", time: null, preview: sent ? "Aguardando resposta" : "Proposta recebida" },
      sortKey: "",
    };
  }

  const messages = await safely(deps.getMessages(request.id, sessionUserId), []);
  const last = messages[messages.length - 1];
  if (!last) {
    return { item: { ...base, kind: "accepted", time: null, preview: "Combinem os detalhes pelo chat" }, sortKey: "" };
  }
  const preview = last.senderId === sessionUserId ? `Você: ${last.content}` : last.content;
  return {
    item: { ...base, kind: "accepted", time: formatConversationTime(last.createdAt), preview },
    sortKey: last.createdAt,
  };
}

/**
 * Lista de conversas da aba Conversas (Spec 076, Figma `06.01`): negociações enviadas e recebidas,
 * sem as recusadas, com a última mensagem das aceitas.
 */
export function useConversationsViewModel(
  sessionUserId: string | null,
  deps: ConversationsDeps = defaultDeps,
): [ConversationsState, { reload: () => Promise<void> }] {
  const load = useCallback(async () => {
    if (!sessionUserId) return [];
    const [sent, received] = await Promise.all([
      deps.listSentRequests(sessionUserId),
      deps.listReceivedRequests(sessionUserId),
    ]);
    const open = (list: readonly RequestWithListing[]) => list.filter((e) => e.request.status !== "rejected");
    const built = await Promise.all([
      ...open(sent).map((e) => buildItem(e, sessionUserId, true, deps)),
      ...open(received).map((e) => buildItem(e, sessionUserId, false, deps)),
    ]);
    return built.sort((a, b) => b.sortKey.localeCompare(a.sortKey)).map((b) => b.item);
  }, [sessionUserId, deps]);

  const [state, reload] = useRequestList<ConversationItem>(load, LOAD_ERROR);
  return [state, { reload }];
}
