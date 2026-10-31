import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { MeetingPoint } from "@/model/entities/meetingPoint";

export type RequestWithListing = Readonly<{
  request: BookRequest;
  listing: Book;
  /** Nome público de quem pediu, só nos pedidos recebidos; `null` quando o perfil não carrega. */
  requesterName?: string | null;
  /** Foto de perfil de quem pediu, só nos recebidos; `null` sem foto (Spec 084). */
  requesterPhotoUrl?: string | null;
}>;

export type RequestResponse = "accept" | "reject";

export type NegotiationDetail = Readonly<{
  request: BookRequest;
  book: Book;
  isOwner: boolean;
  counterpartId: string;
  /** Nome público da contraparte; `null` quando o perfil não pôde ser carregado. */
  counterpartName: string | null;
  /** Foto de perfil da contraparte; `null` sem foto ou sem perfil (Spec 084). */
  counterpartPhotoUrl?: string | null;
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
  /** Busca pedido ativo (pendente ou aceito) do usuário para o anúncio. */
  getActiveRequest(listingId: string, sessionUserId: string | null): Promise<BookRequest | null>;
  /** Quem pediu desiste do pedido ainda pendente; quem anunciou é avisado (Spec 101). */
  cancelRequest(requestId: string, sessionUserId: string | null): Promise<BookRequest>;
}
