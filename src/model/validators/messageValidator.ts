import { sanitizeTextInput } from "@/model/validators/textSanitizer";

export const MESSAGE_MAX_LENGTH = 1000;
export const MESSAGE_MIN_LENGTH = 1;

export type MessageValidationResult =
  | { success: true; sanitizedContent: string }
  | { success: false; error: string };

/**
 * Valida e sanitiza o conteúdo de uma mensagem de negociação (Spec 061 / ADR 0044).
 */
export function validateNegotiationMessage(content: string): MessageValidationResult {
  if (typeof content !== "string") {
    return { success: false, error: "O conteúdo da mensagem deve ser um texto válido." };
  }

  const trimmed = content.trim();
  if (trimmed.length < MESSAGE_MIN_LENGTH) {
    return { success: false, error: "A mensagem não pode ser vazia." };
  }

  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: `A mensagem deve ter no máximo ${MESSAGE_MAX_LENGTH} caracteres.`,
    };
  }

  const sanitized = sanitizeTextInput(trimmed, { allowNewlines: true });
  if (!sanitized) {
    return { success: false, error: "A mensagem contém apenas caracteres inválidos." };
  }

  return { success: true, sanitizedContent: sanitized };
}
