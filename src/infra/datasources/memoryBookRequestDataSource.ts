import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";
import { DataSourceError } from "@/model/errors";

export class MemoryBookRequestDataSource implements IBookRequestDataSource {
  private readonly requests: BookRequest[];

  constructor(requests: readonly BookRequest[] = []) {
    this.requests = requests.map((request) => ({ ...request }));
  }

  async create(request: Omit<BookRequest, "id">): Promise<BookRequest> {
    const created: BookRequest = {
      ...request,
      id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    this.requests.push({ ...created });
    return { ...created };
  }

  async findById(id: string): Promise<BookRequest | null> {
    const found = this.requests.find((request) => request.id === id);
    return found ? { ...found } : null;
  }

  async listByListing(listingId: string): Promise<readonly BookRequest[]> {
    return this.requests.filter((r) => r.listingId === listingId).map((r) => ({ ...r }));
  }

  async listByRequester(requesterId: string): Promise<readonly BookRequest[]> {
    return this.requests.filter((r) => r.requesterId === requesterId).map((r) => ({ ...r }));
  }

  async respond(id: string, status: RequestStatus): Promise<BookRequest> {
    const index = this.requests.findIndex((request) => request.id === id);
    if (index < 0) {
      throw new DataSourceError("Pedido não encontrado.");
    }
    const updated: BookRequest = { ...this.requests[index], status };
    this.requests[index] = updated;
    return { ...updated };
  }
}
