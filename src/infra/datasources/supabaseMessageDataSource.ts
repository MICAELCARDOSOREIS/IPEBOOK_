import type {
  IMessageDataSource,
  CreateNegotiationMessageDTO,
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
}
