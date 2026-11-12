import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IDeliveryDataSource } from "@/model/datasources/iDeliveryDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import {
  DELIVERY_ATTEMPT_MESSAGES,
  DELIVERY_CODE_ALPHABET,
  DELIVERY_CODE_LENGTH,
  DELIVERY_CODE_TTL_MINUTES,
  DELIVERY_MAX_ATTEMPTS,
  type Delivery,
  type DeliveryCode,
} from "@/model/entities/delivery";
import { DataSourceError } from "@/model/errors";

type StoredCode = { code: string; expiresAt: number; attempts: number };

function randomCode(): string {
  let code = "";
  for (let i = 0; i < DELIVERY_CODE_LENGTH; i += 1) {
    code += DELIVERY_CODE_ALPHABET[Math.floor(Math.random() * DELIVERY_CODE_ALPHABET.length)];
  }
  return code;
}

/** Entregas em memória; repete as regras das funções `create_delivery_code` e `complete_delivery` (ADR 0070). */
export class MemoryDeliveryDataSource implements IDeliveryDataSource {
  private readonly codes = new Map<string, StoredCode>();
  private readonly completed = new Map<string, Delivery>();

  constructor(
    private readonly requests: IBookRequestDataSource,
    private readonly books: IBookDataSource,
    private readonly notifications: INotificationDataSource,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async findByRequest(requestId: string): Promise<Delivery | null> {
    const found = this.completed.get(requestId);
    return found ? { ...found } : null;
  }

  async createCode(requestId: string, _actorId: string): Promise<DeliveryCode> {
    const expiresAt = this.now().getTime() + DELIVERY_CODE_TTL_MINUTES * 60_000;
    const code = randomCode();
    this.codes.set(requestId, { code, expiresAt, attempts: 0 });
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  async complete(requestId: string, code: string, actorId: string): Promise<Delivery> {
    const stored = this.codes.get(requestId);
    if (!stored || stored.expiresAt <= this.now().getTime()) {
      throw new DataSourceError(DELIVERY_ATTEMPT_MESSAGES.expirado);
    }
    if (stored.attempts >= DELIVERY_MAX_ATTEMPTS) {
      throw new DataSourceError(DELIVERY_ATTEMPT_MESSAGES.bloqueado);
    }
    if (stored.code !== code) {
      stored.attempts += 1;
      throw new DataSourceError(DELIVERY_ATTEMPT_MESSAGES.incorreto);
    }
    this.codes.delete(requestId);
    const delivery: Delivery = { requestId, completedAt: this.now().toISOString(), completedBy: actorId };
    this.completed.set(requestId, delivery);
    await this.notify(requestId, actorId);
    return { ...delivery };
  }

  private async notify(requestId: string, actorId: string): Promise<void> {
    const request = await this.requests.findById(requestId);
    const book = request ? await this.books.findById(request.listingId) : null;
    if (!request || !book) return;
    const recipient = actorId === request.requesterId ? book.ownerId : request.requesterId;
    await this.notifications.addNotification({
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId: recipient,
      title: "Entrega confirmada",
      message: "A entrega do livro foi confirmada. Avalie a negociação.",
      type: "meeting_update",
      read: false,
      createdAt: this.now().toISOString(),
      actionUrl: `/negociacao/${requestId}`,
    });
  }
}
