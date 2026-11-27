import type { IErrorReporter } from "@/model/services/iErrorReporter";

/** Guarda os erros em memória no aparelho, sem enviar dados para serviços externos (Spec 145 / ADR 0124). */
export class MemoryErrorReporter implements IErrorReporter {
  readonly captured: Array<{ error: unknown; context?: Record<string, unknown> }> = [];

  init(): void {}

  captureException(error: unknown, context?: Record<string, unknown>): void {
    this.captured.push({ error, context });
  }
}
