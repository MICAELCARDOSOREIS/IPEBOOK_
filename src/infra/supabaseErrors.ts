import { DataSourceError, ValidationError } from "@/model/errors";

/** Código dos limites contra abuso do banco (Spec 103 / ADR 0079). */
export const RATE_LIMIT_CODE = "IBLIM";

/**
 * Traduz um erro do Supabase: o limite contra abuso vira `ValidationError` com a mensagem do banco
 * (já em português, para a pessoa); o resto vira `DataSourceError` com a mensagem genérica dada.
 */
export function toDomainError(error: unknown, fallback: string): Error {
  const detail = error as { code?: string; message?: string } | null;
  if (detail?.code === RATE_LIMIT_CODE && detail.message) {
    return new ValidationError(detail.message);
  }
  return new DataSourceError(fallback);
}
