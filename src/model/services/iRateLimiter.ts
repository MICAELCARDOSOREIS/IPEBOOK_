export interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMs: number;
}

export interface IRateLimiter {
  /**
   * Verifica se uma ação identificada por key é permitida e, em caso positivo, registra a tentativa.
   */
  checkAndRecord(
    key: string,
    maxAttempts?: number,
    windowMs?: number
  ): RateLimitCheckResult;

  /**
   * Limpa o histórico de tentativas de uma determinada chave.
   */
  reset(key: string): void;

  /**
   * Retorna o tempo restante em milissegundos para liberação de novas tentativas.
   */
  getTimeUntilResetMs(key: string, windowMs?: number): number;
}
