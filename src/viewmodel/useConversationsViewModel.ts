import { useCallback, useEffect } from "react";
import { bookRequestUseCases, negotiationMessageUseCases, notificationUseCases, publicProfileUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { useRequestList } from "@/viewmodel/useSentRequestsViewModel";

export type ConversationKind = "accepted" | "pendingReceived" | "pendingSent";

export type ConversationItem = Readonly<{
  requestId: string;
  listing: Book;
  otherName: string;
  /** Foto de perfil da outra pessoa; sem foto o avatar mostra o ipê (Spec 084). */
  otherPhotoUrl: string | null;
  preview: string;
  /** Data da última mensagem; `null` sem mensagem. A tela formata e atualiza o rótulo de tempo (Spec 089). */
  lastMessageAt: string | null;
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
  getProfile: (userId: string) => Promise<{ name: string | null; photoUrl: string | null }>;
  /** Apaga a conversa só para esta pessoa (Spec 090). */
  hideConversation?: (requestId: string, sessionUserId: string) => Promise<void>;
  /** Conversas apagadas: id do pedido -> momento do apagar (Spec 090). */
  listHiddenConversations?: (sessionUserId: string) => Promise<Record<string, string>>;
  /** Desiste de um pedido enviado ainda pendente (Spec 101). */
  cancelRequest?: (requestId: string, sessionUserId: string) => Promise<unknown>;
  /** Avisa em tempo real que algo mudou (mensagem nova, pedido novo ou respondido); retorna o cancelamento. */
  subscribe?: (sessionUserId: string, onChange: () => void) => () => void;
};

const defaultDeps: ConversationsDeps = {
  listSentRequests: (id) => bookRequestUseCases.listSentRequests(id),
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
  getMessages: (requestId, sessionUserId) => negotiationMessageUseCases.getMessages(requestId, sessionUserId),
  hideConversation: (requestId, userId) => negotiationMessageUseCases.hideConversation(requestId, userId),
  listHiddenConversations: (userId) => negotiationMessageUseCases.listHiddenConversations(userId),
  cancelRequest: (requestId, userId) => bookRequestUseCases.cancelRequest(requestId, userId),
  getProfile: async (userId) => {
    const profile = await publicProfileUseCases.getPublicProfile(userId);
    return { name: profile.name ?? null, photoUrl: profile.photoUrl ?? null };
  },
  // Pedidos novos e respostas geram notificação; mensagens chegam pela tabela de mensagens (Spec 086)
  subscribe: (sessionUserId, onChange) => {
    const offMessages = negotiationMessageUseCases.subscribeToAllMessages(() => onChange());
    const offNotifications = notificationUseCases.subscribe?.(sessionUserId, onChange) ?? (() => {});
    return () => {
      offMessages();
      offNotifications();
    };
  },
};

/** Maior que qualquer data ISO: ordena a proposta recebida pendente antes das conversas. */
const TOP_SORT_KEY = "9999";
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
  const other = sent
    ? await safely(deps.getProfile(listing.ownerId), { name: null, photoUrl: null })
    : { name: entry.requesterName ?? null, photoUrl: entry.requesterPhotoUrl ?? null };
  const base = { requestId: request.id, listing, otherName: other.name || COMMUNITY_MEMBER, otherPhotoUrl: other.photoUrl };

  if (request.status === "pending") {
    return {
      item: { ...base, kind: sent ? "pendingSent" : "pendingReceived", lastMessageAt: null, preview: sent ? "Aguardando resposta" : "Proposta recebida" },
      // Proposta recebida pede ação: fica no topo, antes de qualquer conversa (Spec 089).
      sortKey: sent ? "" : TOP_SORT_KEY,
    };
  }

  const messages = await safely(deps.getMessages(request.id, sessionUserId), []);
  const last = messages[messages.length - 1];
  if (!last) {
    return { item: { ...base, kind: "accepted", lastMessageAt: null, preview: "Combinem os detalhes pelo chat" }, sortKey: "" };
  }
  const preview = last.senderId === sessionUserId ? `Você: ${last.content}` : last.content;
  return {
    item: { ...base, kind: "accepted", lastMessageAt: last.createdAt, preview },
    sortKey: last.createdAt,
  };
}

/**
 * Lista de conversas da aba Conversas (Spec 076, Figma `06.01`): negociações enviadas e recebidas,
 * sem as recusadas, com a última mensagem das aceitas.
 */
export type ConversationsActions = {
  reload: () => Promise<void>;
  deleteConversation: (requestId: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
};

export function useConversationsViewModel(
  sessionUserId: string | null,
  deps: ConversationsDeps = defaultDeps,
): [ConversationsState, ConversationsActions] {
  const load = useCallback(async () => {
    if (!sessionUserId) return [];
    const [sent, received] = await Promise.all([
      deps.listSentRequests(sessionUserId),
      deps.listReceivedRequests(sessionUserId),
    ]);
    const open = (list: readonly RequestWithListing[]) => list.filter((e) => e.request.status !== "rejected" && e.request.status !== "cancelled");
    const hidden = deps.listHiddenConversations ? await safely(deps.listHiddenConversations(sessionUserId), {}) : {};
    const built = await Promise.all([
      ...open(sent).map((e) => buildItem(e, sessionUserId, true, deps)),
      ...open(received).map((e) => buildItem(e, sessionUserId, false, deps)),
    ]);
    // Conversa apagada some, a menos que tenha chegado mensagem depois de apagar (Spec 090).
    const visible = built.filter(({ item }) => {
      const hiddenAt = hidden[item.requestId];
      return !hiddenAt || (item.lastMessageAt !== null && item.lastMessageAt > hiddenAt);
    });
    return visible.sort((a, b) => b.sortKey.localeCompare(a.sortKey)).map((b) => b.item);
  }, [sessionUserId, deps]);

  const [state, reload] = useRequestList<ConversationItem>(load, LOAD_ERROR);

  useEffect(() => {
    if (!sessionUserId || !deps.subscribe) return;
    return deps.subscribe(sessionUserId, () => void reload());
  }, [sessionUserId, deps, reload]);

  const deleteConversation = useCallback(
    async (requestId: string) => {
      if (!sessionUserId || !deps.hideConversation) return false;
      try {
        await deps.hideConversation(requestId, sessionUserId);
        await reload();
        return true;
      } catch {
        return false;
      }
    },
    [sessionUserId, deps, reload],
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      if (!sessionUserId || !deps.cancelRequest) return false;
      try {
        await deps.cancelRequest(requestId, sessionUserId);
        await reload();
        return true;
      } catch {
        return false;
      }
    },
    [sessionUserId, deps, reload],
  );

  return [state, { reload, deleteConversation, cancelRequest }];
}
