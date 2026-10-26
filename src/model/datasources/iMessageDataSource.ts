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
}
