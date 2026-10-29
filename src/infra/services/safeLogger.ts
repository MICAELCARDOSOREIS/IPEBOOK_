import { ILogger, LogEntry, LogLevel } from "@/model/services/iLogger";

const SENSITIVE_KEYS = new Set([
  "password",
  "senha",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "credential",
  "private_key",
  "service_role",
  "supabase_service_role_key",
  "cpf",
  "credit_card",
  "cartao",
]);

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type LogSink = (entry: LogEntry) => void;

export interface SafeLoggerOptions {
  minLevel?: LogLevel;
  sink?: LogSink;
}

/**
 * Sanitiza recursivamente valores de objetos e arrays para não expor credenciais, senhas ou tokens nos logs.
 */
export function sanitizeContext(data: unknown, seen = new WeakSet()): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    if (typeof data === "string") {
      // Mascara potenciais tokens JWT
      if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(data)) {
        return "[REDACTED_JWT]";
      }
      // Mascara potenciais Bearer tokens
      if (/^Bearer\s+[A-Za-z0-9._-]+$/i.test(data)) {
        return "Bearer [REDACTED]";
      }
    }
    return data;
  }

  if (seen.has(data as object)) {
    return "[CIRCULAR]";
  }
  seen.add(data as object);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, seen));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
    const isSensitive = Array.from(SENSITIVE_KEYS).some(
      (sensitive) => lowerKey.includes(sensitive.replace(/[-_]/g, ""))
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeContext(value, seen);
    }
  }

  return sanitized;
}

/**
 * Implementação segura e estruturada de ILogger em conformidade com as diretrizes de segurança e LGPD.
 */
export class SafeLogger implements ILogger {
  private minLevelPriority: number;
  private sink: LogSink;

  constructor(options: SafeLoggerOptions = {}) {
    const minLevel = options.minLevel ?? "info";
    this.minLevelPriority = LOG_LEVEL_PRIORITY[minLevel];
    this.sink =
      options.sink ??
      ((entry: LogEntry) => {
        const payload = JSON.stringify(entry);
        if (entry.level === "error") {
          console.error(payload);
        } else if (entry.level === "warn") {
          console.warn(payload);
        } else {
          console.log(payload);
        }
      });
  }

  private log(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    if (LOG_LEVEL_PRIORITY[level] < this.minLevelPriority) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = sanitizeContext(context) as Record<string, unknown>;
    }

    if (error !== undefined) {
      if (error instanceof Error) {
        entry.error = error.message;
      } else if (typeof error === "string") {
        entry.error = error;
      } else {
        entry.error = String(error);
      }
    }

    this.sink(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, undefined, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.log("error", message, error, context);
  }
}
