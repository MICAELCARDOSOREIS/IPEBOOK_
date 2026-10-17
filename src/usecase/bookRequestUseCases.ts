import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import { AuthError, ValidationError } from "@/model/errors";
import type {
  IBookRequestUseCases,
  NegotiationDetail,
  RequestResponse,
  RequestWithListing,
} from "@/usecase/iBookRequestUseCases";

function requireSession(sessionUserId: string | null): string {
  if (!sessionUserId) {
    throw new AuthError("Sessão obrigatória para negociar.");
  }
  return sessionUserId;
}

export class BookRequestUseCases implements IBookRequestUseCases {
  constructor(
    private readonly books: IBookDataSource,
    private readonly requests: IBookRequestDataSource,
  ) {}

  async requestNegotiation(listingId: string, sessionUserId: string | null): Promise<BookRequest> {
    const userId = requireSession(sessionUserId);
    const listing = await this.books.findById(listingId);
    if (!listing) {
      throw new ValidationError("Anúncio não encontrado.");
    }
    // FR-001
    if (listing.ownerId === userId) {
      throw new ValidationError("Você não pode negociar o próprio anúncio.");
    }
    // FR-003
    if (listing.status === "reserved") {
      throw new ValidationError("Este anúncio não está mais disponível.");
    }
    // FR-002
    const existing = await this.requests.listByListing(listingId);
    if (existing.some((r) => r.requesterId === userId && r.status === "pending")) {
      throw new ValidationError("Você já tem um pedido pendente para este anúncio.");
    }
    return this.requests.create({ listingId, requesterId: userId, status: "pending" });
  }

  async listReceivedRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]> {
    const userId = requireSession(sessionUserId);
    const myListings = await this.books.listByOwner(userId);
    const result: RequestWithListing[] = [];
    for (const listing of myListings) {
      const requests = await this.requests.listByListing(listing.id);
      for (const request of requests) {
        result.push({ request, listing });
      }
    }
    return result;
  }

  async listSentRequests(sessionUserId: string | null): Promise<readonly RequestWithListing[]> {
    const userId = requireSession(sessionUserId);
    const requests = await this.requests.listByRequester(userId);
    const result: RequestWithListing[] = [];
    for (const request of requests) {
      const listing = await this.books.findById(request.listingId);
      if (listing) {
        result.push({ request, listing });
      }
    }
    return result;
  }

  async respondToRequest(
    requestId: string,
    response: RequestResponse,
    sessionUserId: string | null,
  ): Promise<BookRequest> {
    const userId = requireSession(sessionUserId);
    const request = await this.requests.findById(requestId);
    if (!request) {
      throw new ValidationError("Pedido não encontrado.");
    }
    const listing: Book | null = await this.books.findById(request.listingId);
    if (!listing || listing.ownerId !== userId) {
      throw new AuthError("Somente quem anunciou pode responder a este pedido.");
    }
    // FR-005
    if (request.status !== "pending") {
      throw new ValidationError("Este pedido já foi respondido.");
    }

    if (response === "reject") {
      return this.requests.respond(request.id, "rejected");
    }

    // FR-004
    const accepted = await this.requests.respond(request.id, "accepted");
    const competitors = await this.requests.listByListing(listing.id);
    for (const other of competitors) {
      if (other.id !== request.id && other.status === "pending") {
        await this.requests.respond(other.id, "rejected");
      }
    }
    await this.books.updateStatus(listing.id, "reserved");
    return accepted;
  }

  async getRequestDetail(
    requestId: string,
    sessionUserId: string | null,
  ): Promise<NegotiationDetail> {
    const userId = requireSession(sessionUserId);
    const request = await this.requests.findById(requestId);
    if (!request) {
      throw new ValidationError("Pedido não encontrado.");
    }
    const book = await this.books.findById(request.listingId);
    if (!book) {
      throw new ValidationError("Anúncio não encontrado.");
    }

    const isOwner = book.ownerId === userId;
    const isRequester = request.requesterId === userId;

    if (!isOwner && !isRequester) {
      throw new AuthError("Você não tem permissão para acessar esta negociação.");
    }

    const safeMeetingPoints: readonly string[] = [
      "Campus IFPI Piripiri (Recepção ou Biblioteca)",
      "Praça da Bandeira (Centro)",
      "Praça de Alimentação / Mercado Central",
      "Praça de Eventos",
    ];

    return {
      request,
      book,
      isOwner,
      counterpartId: isOwner ? request.requesterId : book.ownerId,
      safeMeetingPoints,
    };
  }
}
