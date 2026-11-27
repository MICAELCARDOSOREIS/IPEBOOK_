import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";

export interface IBookRequestDataSource {
  create(request: Omit<BookRequest, "id">): Promise<BookRequest>;
  findById(id: string): Promise<BookRequest | null>;
  listByListing(listingId: string): Promise<readonly BookRequest[]>;
  listByRequester(requesterId: string): Promise<readonly BookRequest[]>;
  respond(id: string, status: RequestStatus): Promise<BookRequest>;
  /** Quando disponível, confirma o pedido e atualiza concorrentes e livro numa transação. */
  acceptAtomically?(id: string): Promise<BookRequest>;
  /** Assina mudanças em tempo real no pedido específico (aceite, recusa, cancelamento). */
  subscribeToRequest?(requestId: string, onChange: () => void): () => void;
  /** Assina mudanças em tempo real em todos os pedidos visíveis pela sessão atual (RLS). */
  subscribeToAll?(onChange: () => void): () => void;
}
