import type {
  IMessageDataSource,
  CreateNegotiationMessageDTO,
  MessageSubscriptionCallback,
} from "@/model/datasources/iMessageDataSource";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type MessageRow = {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const columns = "id,request_id,sender_id,content,created_at";

function mapMessage(row: MessageRow): NegotiationMessage {
  return {
    id: row.id,
    requestId: row.request_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

/** Sequência para nomes de canal únicos: o mesmo tópico não aceita novos `.on()` depois de `subscribe()`. */
let channelSeq = 0;

/**
 * Persistência de mensagens de negociação em `v2_negotiation_messages` (Spec 061 / ADR 0044).
 */
export class SupabaseMessageDataSource implements IMessageDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async getMessagesByRequestId(requestId: string): Promise<NegotiationMessage[]> {
    const { data, error } = await this.client
      .from("v2_negotiation_messages")
      .select(columns)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new DataSourceError("Não foi possível carregar as mensagens da negociação.");
    }

    return (data ?? []).map((row) => mapMessage(row as MessageRow));
  }

  async sendMessage(dto: CreateNegotiationMessageDTO): Promise<NegotiationMessage> {
    const { data, error } = await this.client
      .from("v2_negotiation_messages")
      .insert({
        request_id: dto.requestId,
        sender_id: dto.senderId,
        content: dto.content,
      })
      .select(columns)
      .single();

    if (error || !data) {
      throw new DataSourceError("Não foi possível enviar a mensagem. Tente novamente.");
    }

    return mapMessage(data as MessageRow);
  }

  async hideConversation(requestId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_hidden_conversations")
      .upsert({ user_id: userId, request_id: requestId, hidden_at: new Date().toISOString() });
    if (error) {
      throw new DataSourceError("Não foi possível apagar a conversa. Tente novamente.");
    }
  }

  async listHiddenConversations(userId: string): Promise<Record<string, string>> {
    const { data, error } = await this.client
      .from("v2_hidden_conversations")
      .select("request_id,hidden_at")
      .eq("user_id", userId);
    if (error) {
      throw new DataSourceError("Não foi possível carregar as conversas.");
    }
    return Object.fromEntries((data ?? []).map((row) => [row.request_id as string, row.hidden_at as string]));
  }

  subscribeToMessages(
    requestId: string,
    onMessage: MessageSubscriptionCallback
  ): () => void {
    const channel = this.client
      .channel(`negotiation-messages:${requestId}:${++channelSeq}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "v2_negotiation_messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload: { new: MessageRow }) => {
          if (payload?.new) {
            onMessage(mapMessage(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  subscribeToAllMessages(onMessage: MessageSubscriptionCallback): () => void {
    const channel = this.client
      .channel(`negotiation-messages:all:${++channelSeq}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "v2_negotiation_messages" },
        (payload: { new: MessageRow }) => {
          if (payload?.new) {
            onMessage(mapMessage(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
