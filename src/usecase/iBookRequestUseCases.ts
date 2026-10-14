import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";

export type RequestWithListing = Readonly<{
  request: BookRequest;
  listing: Book;
}>;

export type RequestResponse = "accept" | "reject";

export interface IBookRequestUseCases {
  requestNegotiation(listingId: string, sessionUserId: string | null): Promise<BookRequest>;
  listReceivedRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]>;
  listSentRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]>;
  respondToRequest(
    requestId: string,
    response: RequestResponse,
    sessionUserId: string | null,
  ): Promise<BookRequest>;
}
