import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { MeetingPoint } from "@/model/entities/meetingPoint";

export type RequestWithListing = Readonly<{
  request: BookRequest;
  listing: Book;
  /** Nome público de quem pediu, só nos pedidos recebidos; `null` quando o perfil não carrega. */
  requesterName?: string | null;
}>;

export type RequestResponse = "accept" | "reject";

export type NegotiationDetail = Readonly<{
  request: BookRequest;
  book: Book;
  isOwner: boolean;
  counterpartId: string;
  /** Nome público da contraparte; `null` quando o perfil não pôde ser carregado. */
  counterpartName: string | null;
  safeMeetingPoints: readonly MeetingPoint[];
}>;

export interface IBookRequestUseCases {
  requestNegotiation(listingId: string, sessionUserId: string | null): Promise<BookRequest>;
  listReceivedRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]>;
  listSentRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]>;
  respondToRequest(
    requestId: string,
    response: RequestResponse,
    sessionUserId: string | null,
  ): Promise<BookRequest>;
  getRequestDetail(requestId: string, sessionUserId: string | null): Promise<NegotiationDetail>;
}
