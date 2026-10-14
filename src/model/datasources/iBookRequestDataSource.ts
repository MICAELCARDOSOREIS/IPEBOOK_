import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";

export interface IBookRequestDataSource {
  create(request: Omit<BookRequest, "id">): Promise<BookRequest>;
  findById(id: string): Promise<BookRequest | null>;
  listByListing(listingId: string): Promise<readonly BookRequest[]>;
  listByRequester(requesterId: string): Promise<readonly BookRequest[]>;
  respond(id: string, status: RequestStatus): Promise<BookRequest>;
}
