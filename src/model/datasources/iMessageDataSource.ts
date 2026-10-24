import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

export type CreateNegotiationMessageDTO = Readonly<{
  requestId: string;
  senderId: string;
  content: string;
}>;

export interface IMessageDataSource {
  /**
   * Retorna as mensagens de um pedido em ordem cronológica crescente.
   */
  getMessagesByRequestId(requestId: string): Promise<NegotiationMessage[]>;

  /**
   * Persiste uma nova mensagem de negociação.
   */
  sendMessage(dto: CreateNegotiationMessageDTO): Promise<NegotiationMessage>;
}
