import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IDeliveryDataSource } from "@/model/datasources/iDeliveryDataSource";
import type { IMeetingDataSource } from "@/model/datasources/iMeetingDataSource";
import { type Delivery, type DeliveryCode, isValidDeliveryCode, normalizeDeliveryCode } from "@/model/entities/delivery";
import { AuthError, ValidationError } from "@/model/errors";
import type { DeliveryRole, IDeliveryUseCases } from "@/usecase/iDeliveryUseCases";

function requireSession(sessionUserId: string | null): string {
  if (!sessionUserId) throw new AuthError("Sessão obrigatória para concluir a entrega.");
  return sessionUserId;
}

/** Conclusão da negociação por QR code (Spec 095, ADR 0070); o servidor repete as mesmas conferências. */
export class DeliveryUseCases implements IDeliveryUseCases {
  constructor(
    private readonly deliveries: IDeliveryDataSource,
    private readonly requests: IBookRequestDataSource,
    private readonly books: IBookDataSource,
    private readonly meetings: IMeetingDataSource,
  ) {}

  async getDelivery(requestId: string, sessionUserId: string | null): Promise<Delivery | null> {
    await this.roleOf(requestId, requireSession(sessionUserId));
    return this.deliveries.findByRequest(requestId);
  }

  async getRole(requestId: string, sessionUserId: string | null): Promise<DeliveryRole> {
    return this.roleOf(requestId, requireSession(sessionUserId));
  }

  async generateCode(requestId: string, sessionUserId: string | null): Promise<DeliveryCode> {
    const userId = requireSession(sessionUserId);
    if ((await this.roleOf(requestId, userId)) !== "giver") {
      throw new ValidationError("Só quem anunciou o livro mostra o QR da entrega.");
    }
    await this.requireOpenDelivery(requestId);
    return this.deliveries.createCode(requestId, userId);
  }

  async confirmDelivery(requestId: string, code: string, sessionUserId: string | null): Promise<Delivery> {
    const userId = requireSession(sessionUserId);
    if ((await this.roleOf(requestId, userId)) !== "receiver") {
      throw new ValidationError("Só quem recebe o livro lê o QR da entrega.");
    }
    const normalized = normalizeDeliveryCode(code);
    if (!isValidDeliveryCode(normalized)) {
      throw new ValidationError("Código inválido. Confira os 8 caracteres mostrados pelo anunciante.");
    }
    await this.requireOpenDelivery(requestId);
    return this.deliveries.complete(requestId, normalized, userId);
  }

  private async roleOf(requestId: string, userId: string): Promise<DeliveryRole> {
    const request = await this.requests.findById(requestId);
    if (!request || request.status !== "accepted") {
      throw new ValidationError("Negociação não encontrada ou ainda não aceita.");
    }
    const book = await this.books.findById(request.listingId);
    if (book?.ownerId === userId) return "giver";
    if (request.requesterId === userId) return "receiver";
    throw new AuthError("Você não participa desta negociação.");
  }

  /** RN-01 e RN-05: só com encontro confirmado e se a entrega ainda não foi concluída. */
  private async requireOpenDelivery(requestId: string): Promise<void> {
    if (await this.deliveries.findByRequest(requestId)) {
      throw new ValidationError("A entrega desta negociação já foi concluída.");
    }
    const meeting = await this.meetings.findLatestByRequest(requestId);
    if (meeting?.status !== "confirmed") {
      throw new ValidationError("Confirme o encontro antes de concluir a entrega.");
    }
  }
}
