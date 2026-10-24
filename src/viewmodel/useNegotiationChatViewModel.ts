import { useCallback, useEffect, useState } from "react";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { negotiationMessageUseCases } from "@/di/container";

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
};

/**
 * ViewModel para a tela de chat da negociação presencial (Spec 061 / ADR 0044).
 * Figma 06.02, 06.10 (falha de envio) e 06.16 (mensagem enviada).
 */
export function useNegotiationChatViewModel(
  requestId: string,
  sessionUserId: string,
  useCases = negotiationMessageUseCases
): [NegotiationChatState, NegotiationChatActions] {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!requestId || !sessionUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const list = await useCases.getMessages(requestId, sessionUserId);
      setMessages(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar mensagens.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, sessionUserId, useCases]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendText = useCallback(
    async (textToSend: string): Promise<boolean> => {
      const trimmed = textToSend.trim();
      if (!trimmed || isSending) return false;

      setIsSending(true);
      setSendError(null);

      try {
        const sent = await useCases.sendMessage({
          requestId,
          senderId: sessionUserId,
          content: trimmed,
        });

        setMessages((prev) => [...prev, sent]);
        setInputText("");
        setLastFailedText(null);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Não foi possível enviar a mensagem.";
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
    },
  ];
}
