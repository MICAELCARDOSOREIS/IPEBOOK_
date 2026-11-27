import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import type { MessageSubscriptionStatusCallback } from "@/model/datasources/iMessageDataSource";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { DomainError } from "@/model/errors";
import { useAppForegroundRefresh } from "@/viewmodel/useRealtimeSync";

const FALLBACK_POLL_MS = 4_000;
const SAFETY_SYNC_MS = 12_000;

export type NegotiationChatState = {
  messages: NegotiationMessage[];
  inputText: string;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendError: string | null;
};

export type NegotiationChatActions = {
  setInputText: (text: string) => void;
  sendMessage: () => Promise<boolean>;
  retryLastMessage: () => Promise<boolean>;
  reload: () => Promise<void>;
  /** Atualiza mensagens sem piscar o esqueleto de carregamento. */
  refresh?: () => Promise<void>;
};

export type NegotiationChatUseCases = {
  getMessages: (requestId: string, sessionUserId: string) => Promise<NegotiationMessage[]>;
  sendMessage: (params: { requestId: string; senderId: string; content: string }) => Promise<NegotiationMessage>;
  subscribeToMessages?: (
    requestId: string,
    onMessage: (msg: NegotiationMessage) => void,
    onStatus?: MessageSubscriptionStatusCallback,
  ) => () => void;
};

function mergeFetchedWithOptimistic(
  fetched: NegotiationMessage[],
  previous: NegotiationMessage[],
): NegotiationMessage[] {
  const pendingOptimistic = previous.filter(
    (m) =>
      m.id.startsWith("optimistic-") &&
      !fetched.some((f) => f.senderId === m.senderId && f.content === m.content),
  );
  return pendingOptimistic.length > 0 ? [...fetched, ...pendingOptimistic] : fetched;
}

/**
 * ViewModel para a tela de chat da negociação presencial (Spec 061 / ADR 0044).
 * Figma 06.02, 06.10 (falha de envio) e 06.16 (mensagem enviada).
 */
export function useNegotiationChatViewModel(
  requestId: string,
  sessionUserId: string,
  useCases: NegotiationChatUseCases,
): [NegotiationChatState, NegotiationChatActions] {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const optimisticSeq = useRef(0);
  const activeRef = useRef(true);
  const realtimeSubscribedRef = useRef(false);
  const lastSyncAtRef = useRef(0);

  const fetchMessages = useCallback(
    async (silent: boolean) => {
      if (!requestId || !sessionUserId) {
        setIsLoading(false);
        return;
      }

      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }
        const list = await useCases.getMessages(requestId, sessionUserId);
        if (!activeRef.current) return;
        lastSyncAtRef.current = Date.now();
        setMessages((prev) => mergeFetchedWithOptimistic(list, prev));
        if (silent) setError(null);
      } catch (err) {
        if (!activeRef.current) return;
        if (!silent) {
          const msg = err instanceof DomainError ? err.message : "Erro ao carregar mensagens.";
          setError(msg);
        }
      } finally {
        if (!silent && activeRef.current) {
          setIsLoading(false);
        }
      }
    },
    [requestId, sessionUserId, useCases],
  );

  const loadMessages = useCallback(() => fetchMessages(false), [fetchMessages]);
  const refreshMessages = useCallback(() => fetchMessages(true), [fetchMessages]);

  useEffect(() => {
    activeRef.current = true;
    void loadMessages();
    return () => {
      activeRef.current = false;
    };
  }, [loadMessages]);

  useEffect(() => {
    if (!requestId || !useCases.subscribeToMessages) {
      return;
    }

    realtimeSubscribedRef.current = false;
    let needsResyncOnReconnect = false;

    const unsubscribe = useCases.subscribeToMessages(
      requestId,
      (newMsg) => {
        lastSyncAtRef.current = Date.now();
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const optimisticIndex = prev.findIndex(
            (m) =>
              m.id.startsWith("optimistic-") &&
              m.senderId === newMsg.senderId &&
              m.content === newMsg.content,
          );
          if (optimisticIndex !== -1) {
            return prev.map((m, idx) => (idx === optimisticIndex ? newMsg : m));
          }
          return [...prev, newMsg];
        });
      },
      (status) => {
        if (status === "SUBSCRIBED") {
          realtimeSubscribedRef.current = true;
          if (needsResyncOnReconnect || process.env.NODE_ENV !== "test") {
            needsResyncOnReconnect = false;
            void refreshMessages();
          }
        } else {
          realtimeSubscribedRef.current = false;
          needsResyncOnReconnect = true;
        }
      },
    );

    return () => {
      realtimeSubscribedRef.current = false;
      unsubscribe?.();
    };
  }, [requestId, useCases, refreshMessages]);

  useAppForegroundRefresh(() => {
    void refreshMessages();
  }, Boolean(requestId && sessionUserId));

  // Rede de segurança em aparelhos/redes móveis: se o canal Realtime falhar ou demorar a conectar,
  // sincroniza silenciosamente a cada 4s; mesmo conectado, faz checagem leve a cada 12s em primeiro plano.
  useEffect(() => {
    if (process.env.NODE_ENV === "test" || !requestId || !sessionUserId) return;
    const timer = setInterval(() => {
      if (AppState.currentState && AppState.currentState !== "active") return;
      const elapsed = Date.now() - lastSyncAtRef.current;
      const threshold = realtimeSubscribedRef.current ? SAFETY_SYNC_MS : FALLBACK_POLL_MS;
      if (elapsed >= threshold) {
        void refreshMessages();
      }
    }, FALLBACK_POLL_MS);
    return () => clearInterval(timer);
  }, [requestId, sessionUserId, refreshMessages]);

  const handleSendText = useCallback(
    async (textToSend: string): Promise<boolean> => {
      const trimmed = textToSend.trim();
      if (!trimmed || isSending) return false;

      const optimisticId = `optimistic-${++optimisticSeq.current}-${Date.now()}`;
      const optimisticMessage: NegotiationMessage = {
        id: optimisticId,
        requestId,
        senderId: sessionUserId,
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setIsSending(true);
      setSendError(null);
      setMessages((prev) => [...prev, optimisticMessage]);
      setInputText("");

      try {
        const sent = await useCases.sendMessage({
          requestId,
          senderId: sessionUserId,
          content: trimmed,
        });

        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) {
            return prev.filter((m) => m.id !== optimisticId);
          }
          const replaced = prev.map((m) => (m.id === optimisticId ? sent : m));
          return replaced.some((m) => m.id === sent.id) ? replaced : [...replaced, sent];
        });
        setLastFailedText(null);
        return true;
      } catch (err) {
        const msg = err instanceof DomainError ? err.message : "Não foi possível enviar a mensagem.";
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setInputText((current) => (current.trim() === "" ? trimmed : current));
        setSendError(msg);
        setLastFailedText(trimmed);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [requestId, sessionUserId, isSending, useCases]
  );

  const sendMessage = useCallback(async () => {
    return handleSendText(inputText);
  }, [handleSendText, inputText]);

  const retryLastMessage = useCallback(async () => {
    if (!lastFailedText) return false;
    return handleSendText(lastFailedText);
  }, [handleSendText, lastFailedText]);

  return [
    {
      messages,
      inputText,
      isLoading,
      isSending,
      error,
      sendError,
    },
    {
      setInputText,
      sendMessage,
      retryLastMessage,
      reload: loadMessages,
      refresh: refreshMessages,
    },
  ];
}
