import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type RequestRow = {
  id: string;
  listing_id: string;
  requester_id: string;
  status: RequestStatus;
};

function mapRequest(row: RequestRow): BookRequest {
  return {
    id: row.id,
    listingId: row.listing_id,
    requesterId: row.requester_id,
    status: row.status,
  };
}

const columns = "id,listing_id,requester_id,status";

export class SupabaseBookRequestDataSource implements IBookRequestDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async create(request: Omit<BookRequest, "id">): Promise<BookRequest> {
    const { data, error } = await this.client.from("v2_book_requests").insert({
      listing_id: request.listingId,
      requester_id: request.requesterId,
      status: request.status,
    }).select(columns).single();
    if (error || !data) throw new DataSourceError("Não foi possível solicitar a negociação.");
    return mapRequest(data as RequestRow);
  }

  async findById(id: string): Promise<BookRequest | null> {
    const { data, error } = await this.client.from("v2_book_requests").select(columns).eq("id", id).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível consultar o pedido.");
    return data ? mapRequest(data as RequestRow) : null;
  }

  async listByListing(listingId: string): Promise<readonly BookRequest[]> {
    const { data, error } = await this.client.from("v2_book_requests").select(columns).eq("listing_id", listingId);
    if (error) throw new DataSourceError("Não foi possível carregar os pedidos.");
    return (data as RequestRow[]).map(mapRequest);
  }

  async listByRequester(requesterId: string): Promise<readonly BookRequest[]> {
    const { data, error } = await this.client.from("v2_book_requests").select(columns).eq("requester_id", requesterId);
    if (error) throw new DataSourceError("Não foi possível carregar os pedidos.");
    return (data as RequestRow[]).map(mapRequest);
  }

  async respond(id: string, status: RequestStatus): Promise<BookRequest> {
    const { data, error } = await this.client.from("v2_book_requests").update({ status }).eq("id", id).eq("status", "pending").select(columns).single();
    if (error || !data) throw new DataSourceError("Não foi possível responder ao pedido.");
    return mapRequest(data as RequestRow);
  }
}
