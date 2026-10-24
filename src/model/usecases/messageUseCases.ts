import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type { IMessageDataSource } from "@/model/datasources/iMessageDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import { validateNegotiationMessage } from "@/model/validators/messageValidator";

export type MessageUseCaseContext = {
  messageDataSource: IMessageDataSource;
  bookRequestDataSource: IBookRequestDataSource;
  bookDataSource: IBookDataSource;
  blockedUserDataSource?: IBlockedUserDataSource;
};

/**
 * Valida a autorização dos participantes de uma negociação (Spec 061 / ADR 0044).
 */
async function getNegotiationParticipants(
  requestId: string,
  bookRequestDataSource: IBookRequestDataSource,
  bookDataSource: IBookDataSource
): Promise<{ requesterId: string; ownerId: string }> {
  const request = await bookRequestDataSource.findById(requestId);
  if (!request) {
    throw new Error("Pedido não encontrado.");
  }

  if (request.status !== "accepted") {
    throw new Error("Apenas pedidos aceitos possuem canal de mensagens ativo.");
  }

  const book = await bookDataSource.findById(request.listingId);
  if (!book) {
    throw new Error("Livro da negociação não encontrado.");
  }

  return {
    requesterId: request.requesterId,
    ownerId: book.ownerId,
  };
}

/**
 * Caso de uso: Obter histórico de mensagens de uma negociação.
 */
export async function getNegotiationMessages(
  requestId: string,
  sessionUserId: string,
  context: MessageUseCaseContext
): Promise<NegotiationMessage[]> {
  const { requesterId, ownerId } = await getNegotiationParticipants(
    requestId,
    context.bookRequestDataSource,
    context.bookDataSource
  );

  if (sessionUserId !== requesterId && sessionUserId !== ownerId) {
    throw new Error("Não autorizado a acessar as mensagens deste pedido.");
  }

  return context.messageDataSource.getMessagesByRequestId(requestId);
}

export type SendMessageParams = Readonly<{
  requestId: string;
  senderId: string;
  content: string;
}>;

/**
 * Caso de uso: Enviar mensagem na negociação.
 */
export async function sendNegotiationMessage(
  params: SendMessageParams,
  context: MessageUseCaseContext
): Promise<NegotiationMessage> {
  const { requesterId, ownerId } = await getNegotiationParticipants(
    params.requestId,
    context.bookRequestDataSource,
    context.bookDataSource
  );

  if (params.senderId !== requesterId && params.senderId !== ownerId) {
    throw new Error("Não autorizado a enviar mensagens neste pedido.");
  }

  const validation = validateNegotiationMessage(params.content);
  if (!validation.success) {
    throw new Error(validation.error);
  }

  // Verifica bloqueio de usuários (Spec 056 / ADR 0039)
  if (context.blockedUserDataSource) {
    const recipientId = params.senderId === requesterId ? ownerId : requesterId;
    const isBlocked = await context.blockedUserDataSource.isBlocked(
      params.senderId,
      recipientId
    );
    if (isBlocked) {
      throw new Error("Não é possível enviar mensagens para um usuário bloqueado.");
    }
  }

  return context.messageDataSource.sendMessage({
    requestId: params.requestId,
    senderId: params.senderId,
    content: validation.sanitizedContent,
  });
}
