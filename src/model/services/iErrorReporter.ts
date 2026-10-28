/** Envio de erros inesperados para acompanhamento (Spec 104 / ADR 0080). Sem chave configurada, não faz nada. */
export interface IErrorReporter {
  init(): void;
  captureException(error: unknown, context?: Record<string, unknown>): void;
}
