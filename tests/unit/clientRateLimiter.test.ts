import { describe, expect, it, vi } from "vitest";
import { ClientRateLimiter } from "@/infra/services/clientRateLimiter";

describe("ClientRateLimiter", () => {
  it("permite requisições dentro do limite configurado", () => {
    const limiter = new ClientRateLimiter({ defaultMaxAttempts: 3, defaultWindowMs: 10_000 });

    const res1 = limiter.checkAndRecord("user-1:create-report");
    expect(res1.allowed).toBe(true);
    expect(res1.remainingAttempts).toBe(2);
    expect(res1.retryAfterMs).toBe(0);

    const res2 = limiter.checkAndRecord("user-1:create-report");
    expect(res2.allowed).toBe(true);
    expect(res2.remainingAttempts).toBe(1);

    const res3 = limiter.checkAndRecord("user-1:create-report");
    expect(res3.allowed).toBe(true);
    expect(res3.remainingAttempts).toBe(0);

    // 4ª tentativa excede o limite de 3
    const res4 = limiter.checkAndRecord("user-1:create-report");
    expect(res4.allowed).toBe(false);
    expect(res4.remainingAttempts).toBe(0);
    expect(res4.retryAfterMs).toBeGreaterThan(0);
  });

  it("isola chaves de identificação diferentes", () => {
    const limiter = new ClientRateLimiter({ defaultMaxAttempts: 1, defaultWindowMs: 5000 });

    const userA = limiter.checkAndRecord("user-a:send-proposal");
    const userB = limiter.checkAndRecord("user-b:send-proposal");

    expect(userA.allowed).toBe(true);
    expect(userB.allowed).toBe(true);

    // Repetir para user-a bloqueia apenas user-a
    expect(limiter.checkAndRecord("user-a:send-proposal").allowed).toBe(false);
    expect(limiter.checkAndRecord("user-b:send-proposal").allowed).toBe(false);
  });

  it("libera novas tentativas após o término da janela deslizante", () => {
    vi.useFakeTimers();
    try {
      const limiter = new ClientRateLimiter({ defaultMaxAttempts: 2, defaultWindowMs: 5000 });

      expect(limiter.checkAndRecord("test-key").allowed).toBe(true);
      expect(limiter.checkAndRecord("test-key").allowed).toBe(true);
      expect(limiter.checkAndRecord("test-key").allowed).toBe(false);

      // Avança o tempo além da janela de 5000ms
      vi.advanceTimersByTime(5100);

      const afterWindow = limiter.checkAndRecord("test-key");
      expect(afterWindow.allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("permite redefinir manualmente as tentativas de uma chave com reset()", () => {
    const limiter = new ClientRateLimiter({ defaultMaxAttempts: 1, defaultWindowMs: 60_000 });

    expect(limiter.checkAndRecord("user-blocked").allowed).toBe(true);
    expect(limiter.checkAndRecord("user-blocked").allowed).toBe(false);

    limiter.reset("user-blocked");

    expect(limiter.checkAndRecord("user-blocked").allowed).toBe(true);
  });

  it("calcula corretamente o tempo restante até o reset", () => {
    vi.useFakeTimers();
    try {
      const limiter = new ClientRateLimiter({ defaultMaxAttempts: 1, defaultWindowMs: 10_000 });
      limiter.checkAndRecord("calc-time");

      vi.advanceTimersByTime(4000);
      const remaining = limiter.getTimeUntilResetMs("calc-time");
      expect(remaining).toBeCloseTo(6000, -2);
    } finally {
      vi.useRealTimers();
    }
  });
});
