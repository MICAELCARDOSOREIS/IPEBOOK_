import { useCallback, useEffect, useRef, useState } from "react";
import { BookCoverCache, bookCoverCache as defaultCache } from "./bookCoverCache";

export type BookCoverImageStatus = "idle" | "loading" | "loaded" | "error";

export type UseBookCoverImageOptions = {
  url?: string;
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
  cache?: BookCoverCache;
};

export type UseBookCoverImageResult = {
  status: BookCoverImageStatus;
  isLoading: boolean;
  isLoaded: boolean;
  hasFailed: boolean;
  retryCount: number;
  retryKey: number;
  onLoad: () => void;
  onError: () => void;
  reload: () => void;
};

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_INITIAL_BACKOFF_MS = 500;

/**
 * Hook de ciclo de vida e resiliência para carregamento de capas de livros (Spec 040, ADR 0034).
 * Fornece cache em memória, timeout de 5 segundos e retries automáticos com backoff progressivo.
 */
export function useBookCoverImage({
  url,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRetries = DEFAULT_MAX_RETRIES,
  initialBackoffMs = DEFAULT_INITIAL_BACKOFF_MS,
  cache = defaultCache,
}: UseBookCoverImageOptions = {}): UseBookCoverImageResult {
  const isMountedRef = useRef(true);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRetriesRef = useRef<number>(0);

  const configRef = useRef({ timeoutMs, maxRetries, initialBackoffMs, cache, url });
  configRef.current = { timeoutMs, maxRetries, initialBackoffMs, cache, url };

  const getInitialStatus = (targetUrl?: string): BookCoverImageStatus => {
    if (!targetUrl) return "idle";
    const cached = cache.getStatus(targetUrl);
    if (cached === "loaded") return "loaded";
    if (cached === "error") return "error";
    return "loading";
  };

  const [status, setStatus] = useState<BookCoverImageStatus>(() => getInitialStatus(url));
  const [retryCount, setRetryCount] = useState<number>(0);
  const [retryKey, setRetryKey] = useState<number>(0);

  const clearTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const triggerFailure = useCallback(() => {
    if (!isMountedRef.current) return;
    const { url: currentUrl, maxRetries: maxR, initialBackoffMs: backoff, cache: c, timeoutMs: tMs } = configRef.current;
    if (!currentUrl) return;

    clearTimers();

    if (currentRetriesRef.current < maxR) {
      currentRetriesRef.current += 1;
      const nextRetry = currentRetriesRef.current;
      setRetryCount(nextRetry);

      const delay = backoff * nextRetry;
      retryTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setRetryKey((k) => k + 1);

        // Reinicia timeout para a nova tentativa
        timeoutTimerRef.current = setTimeout(() => {
          triggerFailure();
        }, tMs);
      }, delay);
    } else {
      // Esgotou tentativas: marca falha definitiva
      c.setError(currentUrl);
      setStatus("error");
    }
  }, [clearTimers]);

  const onLoad = useCallback(() => {
    if (!isMountedRef.current) return;
    const { url: currentUrl, cache: c } = configRef.current;
    if (!currentUrl) return;

    clearTimers();
    c.setLoaded(currentUrl);
    setStatus("loaded");
  }, [clearTimers]);

  const onError = useCallback(() => {
    triggerFailure();
  }, [triggerFailure]);

  const reload = useCallback(() => {
    clearTimers();
    currentRetriesRef.current = 0;
    setRetryCount(0);
    const { url: currentUrl, cache: c, timeoutMs: tMs } = configRef.current;
    if (!currentUrl) {
      setStatus("idle");
      return;
    }
    c.delete(currentUrl);
    setRetryKey((k) => k + 1);
    setStatus("loading");

    timeoutTimerRef.current = setTimeout(() => {
      triggerFailure();
    }, tMs);
  }, [clearTimers, triggerFailure]);

  useEffect(() => {
    isMountedRef.current = true;
    clearTimers();
    currentRetriesRef.current = 0;
    setRetryCount(0);

    if (!url) {
      setStatus("idle");
      return;
    }

    const cached = cache.getStatus(url);
    if (cached === "loaded") {
      setStatus("loaded");
      return;
    }
    if (cached === "error") {
      setStatus("error");
      return;
    }

    setStatus("loading");

    timeoutTimerRef.current = setTimeout(() => {
      triggerFailure();
    }, timeoutMs);

    return () => {
      clearTimers();
    };
  }, [url, cache, timeoutMs, clearTimers, triggerFailure]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  return {
    status,
    isLoading: status === "loading",
    isLoaded: status === "loaded",
    hasFailed: status === "error",
    retryCount,
    retryKey,
    onLoad,
    onError,
    reload,
  };
}

export default useBookCoverImage;
