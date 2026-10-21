import type { IRateLimiter } from "@/model/services/iRateLimiter";

export type FormGuardResult =
  | { allowed: true }
  | { allowed: false; message: string };

/** Limite padrão de envios do mesmo formulário dentro da janela (ADR 0027). */
export const DEFAULT_FORM_ATTEMPTS = 5;
export const DEFAULT_FORM_WINDOW_MS = 60_000;

function formatWait(retryAfterMs: number): string {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  if (seconds < 60) return `${seconds} segundo${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes === 1 ? "" : "s"}`;
}

/**
 * Aplica o limite de tentativas do cliente a um envio de formulário e devolve a mensagem que a
 * tela mostra quando o limite é atingido. Mantido como função pura para que cada ViewModel só
 * precise decidir a chave da ação, e para que o comportamento seja testável sem renderizar tela.
 */
export function guardFormSubmit(
  rateLimiter: IRateLimiter,
  key: string,
  maxAttempts: number = DEFAULT_FORM_ATTEMPTS,
  windowMs: number = DEFAULT_FORM_WINDOW_MS,
): FormGuardResult {
  const result = rateLimiter.checkAndRecord(key, maxAttempts, windowMs);
  if (result.allowed) return { allowed: true };
  return {
    allowed: false,
    message: `Muitas tentativas seguidas. Tente de novo em ${formatWait(result.retryAfterMs)}.`,
  };
}

/** Chave estável por ação e alvo, sem expor dado pessoal no identificador. */
export function formKey(action: string, target?: string | null): string {
  const normalized = (target ?? "").trim().toLowerCase();
  return normalized ? `${action}:${normalized}` : action;
}
