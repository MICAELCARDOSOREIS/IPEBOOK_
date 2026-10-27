import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type {
  IMessageDataSource,
  CreateNegotiationMessageDTO,
  MessageSubscriptionCallback,
} from "@/model/datasources/iMessageDataSource";

/**
 * Implementação em memória de IMessageDataSource (Spec 061 / ADR 0044).
 */
export class MemoryMessageDataSource implements IMessageDataSource {
  private messages: NegotiationMessage[] = [];
  private hidden = new Map<string, string>();
  private listeners = new Map<string, Set<MessageSubscriptionCallback>>();

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

    const set = this.listeners.get(dto.requestId);
    if (set) {
      for (const callback of set) {
        try {
          callback(message);
        } catch {
          // Ignora falhas de execução no listener para isolar o fluxo
        }
      }
    }

    return message;
  }

  subscribeToMessages(
    requestId: string,
    onMessage: MessageSubscriptionCallback
  ): () => void {
    let set = this.listeners.get(requestId);
    if (!set) {
      set = new Set();
      this.listeners.set(requestId, set);
    }
    set.add(onMessage);

    return () => {
      const current = this.listeners.get(requestId);
      if (current) {
        current.delete(onMessage);
        if (current.size === 0) {
          this.listeners.delete(requestId);
        }
      }
    };
  }

  async hideConversation(requestId: string, userId: string): Promise<void> {
    this.hidden.set(`${userId}:${requestId}`, new Date().toISOString());
  }

  async listHiddenConversations(userId: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const [key, at] of this.hidden) {
      if (key.startsWith(`${userId}:`)) result[key.slice(userId.length + 1)] = at;
    }
    return result;
  }

  /** Auxiliar para testes */
  clear(): void {
    this.messages = [];
    this.hidden.clear();
    this.listeners.clear();
  }
}
