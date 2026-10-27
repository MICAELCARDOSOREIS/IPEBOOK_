import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

export type CreateNegotiationMessageDTO = Readonly<{
  requestId: string;
  senderId: string;
  content: string;
}>;

export type MessageSubscriptionCallback = (message: NegotiationMessage) => void;

export interface IMessageDataSource {
  /**
   * Retorna as mensagens de um pedido em ordem cronológica crescente.
   */
  getMessagesByRequestId(requestId: string): Promise<NegotiationMessage[]>;

  /**
   * Persiste uma nova mensagem de negociação.
   */
  sendMessage(dto: CreateNegotiationMessageDTO): Promise<NegotiationMessage>;

  /**
   * Assina o fluxo de novas mensagens em tempo real para um pedido de negociação.
   * Retorna uma função de cancelamento da assinatura.
   */
  subscribeToMessages?(requestId: string, onMessage: MessageSubscriptionCallback): () => void;

  /**
   * Assina todas as mensagens novas que a pessoa pode ver (a RLS filtra), para a lista de conversas (Spec 086).
   */
  subscribeToAllMessages?(onMessage: MessageSubscriptionCallback): () => void;

  /**
   * Oculta a conversa só para esta pessoa (Spec 090); mensagem posterior a esse momento a traz de volta.
   */
  hideConversation?(requestId: string, userId: string): Promise<void>;

  /**
   * Conversas ocultas pela pessoa: id do pedido -> momento (ISO) em que foi apagada.
   */
  listHiddenConversations?(userId: string): Promise<Record<string, string>>;
}
