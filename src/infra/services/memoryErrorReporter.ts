import type { IErrorReporter } from "@/model/services/iErrorReporter";

/** Guarda os erros em memória; usado em testes e quando não há chave do Sentry. */
export class MemoryErrorReporter implements IErrorReporter {
  readonly captured: Array<{ error: unknown; context?: Record<string, unknown> }> = [];

  init(): void {}

  captureException(error: unknown, context?: Record<string, unknown>): void {
    this.captured.push({ error, context });
  }
}
