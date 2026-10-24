/**
 * Entidade de Mensagem da Negociação (Spec 061 / ADR 0044).
 * Representa uma mensagem direta trocada entre os dois participantes de um pedido aceito.
 */
export type NegotiationMessage = Readonly<{
  id: string;
  requestId: string;
  senderId: string;
  content: string;
  createdAt: string;
}>;
