import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type {
  IMessageDataSource,
  CreateNegotiationMessageDTO,
} from "@/model/datasources/iMessageDataSource";

/**
 * Implementação em memória de IMessageDataSource (Spec 061 / ADR 0044).
 */
export class MemoryMessageDataSource implements IMessageDataSource {
  private messages: NegotiationMessage[] = [];

  constructor(initialMessages: NegotiationMessage[] = []) {
    this.messages = [...initialMessages];
  }

  async getMessagesByRequestId(requestId: string): Promise<NegotiationMessage[]> {
    return this.messages
      .filter((m) => m.requestId === requestId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async sendMessage(dto: CreateNegotiationMessageDTO): Promise<NegotiationMessage> {
    const message: NegotiationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      requestId: dto.requestId,
      senderId: dto.senderId,
      content: dto.content,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(message);
    return message;
  }

  /** Auxiliar para testes */
  clear(): void {
    this.messages = [];
  }
}
