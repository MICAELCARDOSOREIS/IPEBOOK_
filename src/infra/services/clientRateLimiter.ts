import {
  IRateLimiter,
  RateLimitCheckResult,
} from "@/model/services/iRateLimiter";

export interface RateLimiterDefaultOptions {
  defaultMaxAttempts?: number;
  defaultWindowMs?: number;
}

/**
 * Implementação em memória de limitação de taxa (sliding window) para proteção
 * contra rajadas de cliques, spam de requisições e abuso de endpoints no cliente.
 */
export class ClientRateLimiter implements IRateLimiter {
  private attemptsByKey = new Map<string, number[]>();
  private readonly defaultMaxAttempts: number;
  private readonly defaultWindowMs: number;

  constructor(options: RateLimiterDefaultOptions = {}) {
    this.defaultMaxAttempts = options.defaultMaxAttempts ?? 5;
    this.defaultWindowMs = options.defaultWindowMs ?? 60_000; // 1 minuto
  }

  private cleanOldAttempts(timestamps: number[], windowMs: number, now: number): number[] {
    const cutoff = now - windowMs;
    return timestamps.filter((ts) => ts > cutoff);
  }

  checkAndRecord(
    key: string,
    maxAttempts = this.defaultMaxAttempts,
    windowMs = this.defaultWindowMs
  ): RateLimitCheckResult {
    const now = Date.now();
    const existing = this.attemptsByKey.get(key) ?? [];
    const validAttempts = this.cleanOldAttempts(existing, windowMs, now);

    if (validAttempts.length >= maxAttempts) {
      const oldestAttempt = validAttempts[0];
      const retryAfterMs = Math.max(0, windowMs - (now - oldestAttempt));

      this.attemptsByKey.set(key, validAttempts);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs,
      };
    }

    validAttempts.push(now);
    this.attemptsByKey.set(key, validAttempts);

    return {
      allowed: true,
      remainingAttempts: maxAttempts - validAttempts.length,
      retryAfterMs: 0,
    };
  }

  reset(key: string): void {
    this.attemptsByKey.delete(key);
  }

  getTimeUntilResetMs(key: string, windowMs = this.defaultWindowMs): number {
    const now = Date.now();
    const existing = this.attemptsByKey.get(key);
    if (!existing || existing.length === 0) {
      return 0;
    }

    const validAttempts = this.cleanOldAttempts(existing, windowMs, now);
    if (validAttempts.length === 0) {
      this.attemptsByKey.delete(key);
      return 0;
    }

    const oldestAttempt = validAttempts[0];
    return Math.max(0, windowMs - (now - oldestAttempt));
  }
}
