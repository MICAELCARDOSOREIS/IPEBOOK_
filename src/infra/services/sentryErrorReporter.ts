import * as Sentry from "@sentry/react-native";
import { sanitizeContext } from "@/infra/services/safeLogger";
import type { IErrorReporter } from "@/model/services/iErrorReporter";

type SentryApi = Pick<typeof Sentry, "init" | "captureException">;

export type SentryErrorReporterOptions = {
  dsn: string;
  environment: string;
  release?: string;
};

/**
 * Erros e travamentos para o Sentry (Spec 104 / ADR 0080). Sem dados pessoais: `sendDefaultPii` desligado,
 * sem IP e com o contexto passado pelo mesmo filtro do `SafeLogger` (senhas, tokens e chaves).
 */
export class SentryErrorReporter implements IErrorReporter {
  private started = false;

  constructor(
    private readonly options: SentryErrorReporterOptions,
    private readonly sentry: SentryApi = Sentry,
  ) {}

  init(): void {
    if (this.started) return;
    this.started = true;
    this.sentry.init({
      dsn: this.options.dsn,
      environment: this.options.environment,
      release: this.options.release,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend(event) {
        if (event.user) event.user = { id: event.user.id };
        if (event.extra) event.extra = sanitizeContext(event.extra) as Record<string, unknown>;
        return event;
      },
    });
  }

  captureException(error: unknown, context?: Record<string, unknown>): void {
    if (!this.started) return;
    this.sentry.captureException(error, context ? { extra: sanitizeContext(context) as Record<string, unknown> } : undefined);
  }
}
