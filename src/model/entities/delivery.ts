/** Entrega do livro concluída por QR code (Spec 095, ADR 0070). */
export type Delivery = Readonly<{
  requestId: string;
  /** Quando as duas pessoas confirmaram a entrega, em ISO 8601. */
  completedAt: string;
  completedBy: string;
}>;

/** Código de uso único que o anunciante mostra ao leitor. */
export type DeliveryCode = Readonly<{
  code: string;
  /** Quando o código deixa de valer, em ISO 8601. */
  expiresAt: string;
}>;

export const DELIVERY_CODE_LENGTH = 8;
/** Sem 0/O, 1/I/L para não confundir quando a pessoa digita o código. */
export const DELIVERY_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const DELIVERY_CODE_TTL_MINUTES = 15;
export const DELIVERY_MAX_ATTEMPTS = 5;

const PAYLOAD_PREFIX = "ipebook:entrega";

/** Conteúdo do QR code: `ipebook:entrega:<pedido>:<código>`. */
export function buildDeliveryPayload(requestId: string, code: string): string {
  return `${PAYLOAD_PREFIX}:${requestId}:${code}`;
}

/** Lê o conteúdo de um QR; `null` se não for de uma entrega do IpêBook. */
export function parseDeliveryPayload(payload: string): { requestId: string; code: string } | null {
  const match = new RegExp(`^${PAYLOAD_PREFIX}:([0-9a-fA-F-]{8,64}):([${DELIVERY_CODE_ALPHABET}]{${DELIVERY_CODE_LENGTH}})$`).exec(
    payload.trim().toUpperCase().replace(/^IPEBOOK:ENTREGA/, PAYLOAD_PREFIX),
  );
  return match ? { requestId: match[1].toLowerCase(), code: match[2] } : null;
}

/** Normaliza o que a pessoa digitou: sem espaços nem hífens, em maiúsculas. */
export function normalizeDeliveryCode(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidDeliveryCode(code: string): boolean {
  return new RegExp(`^[${DELIVERY_CODE_ALPHABET}]{${DELIVERY_CODE_LENGTH}}$`).test(code);
}

/** Resultado de uma tentativa de confirmar a entrega, como devolvido pela função `complete_delivery`. */
export type DeliveryAttempt = "ok" | "incorreto" | "expirado" | "bloqueado";

export const DELIVERY_ATTEMPT_MESSAGES: Readonly<Record<Exclude<DeliveryAttempt, "ok">, string>> = {
  incorreto: "Código incorreto.",
  expirado: "O código expirou. Peça ao anunciante para gerar outro.",
  bloqueado: "Muitas tentativas erradas. Peça ao anunciante para gerar outro código.",
};
