import type { IDeliveryDataSource } from "@/model/datasources/iDeliveryDataSource";
import {
  DELIVERY_ATTEMPT_MESSAGES,
  type Delivery,
  type DeliveryAttempt,
  type DeliveryCode,
} from "@/model/entities/delivery";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type DeliveryRow = { request_id: string; completed_by: string; completed_at: string };
type CodeRow = { code: string; expires_at: string };
type AttemptRow = { resultado: DeliveryAttempt; concluida_em: string | null };

/** `raise exception` das funções chega com este código; a mensagem já está em português para a pessoa. */
const RAISE_EXCEPTION = "P0001";

function messageOf(error: { code?: string; message?: string }, fallback: string): string {
  return error.code === RAISE_EXCEPTION && error.message ? error.message : fallback;
}

/** Entrega por QR code em `v2_deliveries`; o código e as conferências ficam nas funções do banco (ADR 0070). */
export class SupabaseDeliveryDataSource implements IDeliveryDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async findByRequest(requestId: string): Promise<Delivery | null> {
    const { data, error } = await this.client
      .from("v2_deliveries")
      .select("request_id,completed_by,completed_at")
      .eq("request_id", requestId)
      .maybeSingle();
    if (error) throw new DataSourceError("Não foi possível carregar a entrega.");
    if (!data) return null;
    const row = data as DeliveryRow;
    return { requestId: row.request_id, completedBy: row.completed_by, completedAt: row.completed_at };
  }

  async createCode(requestId: string, _actorId: string): Promise<DeliveryCode> {
    const { data, error } = await this.client.rpc("create_delivery_code", { target_request_id: requestId });
    if (error) throw new DataSourceError(messageOf(error, "Não foi possível gerar o código da entrega."));
    const row = (data as CodeRow[] | null)?.[0];
    if (!row) throw new DataSourceError("Não foi possível gerar o código da entrega.");
    return { code: row.code, expiresAt: row.expires_at };
  }

  async complete(requestId: string, code: string, actorId: string): Promise<Delivery> {
    const { data, error } = await this.client.rpc("complete_delivery", { target_request_id: requestId, informado: code });
    if (error) throw new DataSourceError(messageOf(error, "Não foi possível confirmar a entrega."));
    const row = (data as AttemptRow[] | null)?.[0];
    if (!row) throw new DataSourceError("Não foi possível confirmar a entrega.");
    if (row.resultado !== "ok" || !row.concluida_em) {
      throw new DataSourceError(DELIVERY_ATTEMPT_MESSAGES[row.resultado === "ok" ? "incorreto" : row.resultado]);
    }
    return { requestId, completedBy: actorId, completedAt: row.concluida_em };
  }
}
