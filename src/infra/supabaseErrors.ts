import { DataSourceError, ValidationError } from "@/model/errors";

/** Código dos limites contra abuso do banco (Spec 103 / ADR 0079). */
export const RATE_LIMIT_CODE = "IBLIM";

export const NETWORK_ERROR_MESSAGE = "Sem conexão com a internet. Verifique sua rede e tente novamente.";

/**
 * Traduz um erro do Supabase ou de transporte (Spec 103 / Spec 131 / ADR 0102):
 * - Limite contra abuso vira `ValidationError` com a mensagem do banco;
 * - Falha de conexão de rede ou timeout vira `DataSourceError` com mensagem educativa de internet;
 * - Outros erros viram `DataSourceError` com a mensagem genérica dada.
 */
export function toDomainError(error: unknown, fallback: string): Error {
  const detail = error as { code?: string; message?: string; name?: string } | null;
  if (detail?.code === RATE_LIMIT_CODE && detail.message) {
    return new ValidationError(detail.message);
  }

  const rawName = (detail?.name ?? (error instanceof Error ? error.name : "")).toLowerCase();
  const rawMessage = (detail?.message ?? (error instanceof Error ? error.message : String(error ?? ""))).toLowerCase();

  const isNetworkFailure =
    rawName === "aborterror" ||
    rawMessage.includes("network request failed") ||
    rawMessage.includes("failed to fetch") ||
    rawMessage.includes("networkerror") ||
    rawMessage.includes("aborterror");

  if (isNetworkFailure) {
    return new DataSourceError(NETWORK_ERROR_MESSAGE);
  }

  return new DataSourceError(fallback);
}
