import type { BookRequest, RequestStatus } from "@/model/entities/bookRequest";

export interface IBookRequestDataSource {
  create(request: BookRequest): Promise<BookRequest>;
  listByOwner(ownerId: string): Promise<readonly BookRequest[]>;
  listByRequester(requesterId: string): Promise<readonly BookRequest[]>;
  respond(id: string, status: RequestStatus): Promise<BookRequest>;
}
