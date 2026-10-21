import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookCoverCache } from "@/viewmodel/bookCoverCache";
import {
  type UseBookCoverImageOptions,
  type UseBookCoverImageResult,
  useBookCoverImage,
} from "@/viewmodel/useBookCoverImage";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  while (mounted.length) {
    const renderer = mounted.pop();
    act(() => {
      renderer?.unmount();
    });
  }
});

function renderBookCoverHook(initialOptions: UseBookCoverImageOptions = {}) {
  let hookResult!: UseBookCoverImageResult;
  let currentOptions = initialOptions;

  function Probe() {
    hookResult = useBookCoverImage(currentOptions);
    return null;
  }

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(createElement(Probe));
  });
  mounted.push(renderer);

  return {
    get current() {
      return hookResult;
    },
    rerender: (newOptions: UseBookCoverImageOptions) => {
      currentOptions = newOptions;
      act(() => {
        renderer.update(createElement(Probe));
      });
    },
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

describe("useBookCoverImage (Spec 040, ADR 0034)", () => {
  let testCache: BookCoverCache;

  beforeEach(() => {
    vi.useFakeTimers();
    testCache = new BookCoverCache(50);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("retorna idle quando url não é fornecida", () => {
    const probe = renderBookCoverHook({ cache: testCache });
    expect(probe.current.status).toBe("idle");
    expect(probe.current.isLoading).toBe(false);
    expect(probe.current.isLoaded).toBe(false);
    expect(probe.current.hasFailed).toBe(false);
    expect(probe.current.retryCount).toBe(0);
  });

  it("inicia em loading para uma nova url", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/livro.jpg",
      cache: testCache,
    });
    expect(probe.current.status).toBe("loading");
    expect(probe.current.isLoading).toBe(true);
    expect(probe.current.isLoaded).toBe(false);
  });

  it("inicia imediatamente em loaded quando a URL já está no cache", () => {
    testCache.setLoaded("https://example.com/capa-cacheada.jpg");

    const probe = renderBookCoverHook({
      url: "https://example.com/capa-cacheada.jpg",
      cache: testCache,
    });

    expect(probe.current.status).toBe("loaded");
    expect(probe.current.isLoading).toBe(false);
    expect(probe.current.isLoaded).toBe(true);
    expect(probe.current.hasFailed).toBe(false);
  });

  it("inicia imediatamente em error quando a URL já falhou definitivamente no cache", () => {
    testCache.setError("https://example.com/capa-falha.jpg");

    const probe = renderBookCoverHook({
      url: "https://example.com/capa-falha.jpg",
      cache: testCache,
    });

    expect(probe.current.status).toBe("error");
    expect(probe.current.isLoading).toBe(false);
    expect(probe.current.hasFailed).toBe(true);
  });

  it("transita para loaded ao chamar onLoad e persiste no cache", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/sucesso.jpg",
      cache: testCache,
    });

    expect(probe.current.status).toBe("loading");

    act(() => {
      probe.current.onLoad();
    });

    expect(probe.current.status).toBe("loaded");
    expect(probe.current.isLoading).toBe(false);
    expect(probe.current.isLoaded).toBe(true);
    expect(testCache.isLoaded("https://example.com/sucesso.jpg")).toBe(true);
  });

  it("executa retry automático com backoff em caso de onError", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/retry.jpg",
      cache: testCache,
      maxRetries: 2,
      initialBackoffMs: 500,
      timeoutMs: 5000,
    });

    expect(probe.current.retryCount).toBe(0);

    // 1ª falha via onError
    act(() => {
      probe.current.onError();
    });

    expect(probe.current.retryCount).toBe(1);
    expect(probe.current.status).toBe("loading");

    // Avança o tempo de backoff da 1ª tentativa (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 2ª falha via onError
    act(() => {
      probe.current.onError();
    });

    expect(probe.current.retryCount).toBe(2);
    expect(probe.current.status).toBe("loading");

    // Avança o tempo de backoff da 2ª tentativa (1000ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 3ª falha (esgota maxRetries de 2)
    act(() => {
      probe.current.onError();
    });

    expect(probe.current.status).toBe("error");
    expect(probe.current.hasFailed).toBe(true);
    expect(testCache.hasFailed("https://example.com/retry.jpg")).toBe(true);
  });

  it("dispara retry automático quando o timeout expira sem onLoad", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/timeout.jpg",
      cache: testCache,
      timeoutMs: 3000,
      maxRetries: 1,
      initialBackoffMs: 400,
    });

    expect(probe.current.retryCount).toBe(0);

    // Expira o timeout inicial de 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(probe.current.retryCount).toBe(1);
    expect(probe.current.status).toBe("loading");

    // Avança o backoff (400ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Expira o timeout da nova tentativa (3000ms)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Como maxRetries era 1, agora falhou definitivamente
    expect(probe.current.status).toBe("error");
    expect(probe.current.hasFailed).toBe(true);
    expect(testCache.hasFailed("https://example.com/timeout.jpg")).toBe(true);
  });

  it("recupera com sucesso se onLoad ocorrer após um retry", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/recupera.jpg",
      cache: testCache,
      maxRetries: 2,
      initialBackoffMs: 200,
    });

    act(() => {
      probe.current.onError();
    });

    expect(probe.current.retryCount).toBe(1);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Agora responde com sucesso na 2ª tentativa
    act(() => {
      probe.current.onLoad();
    });

    expect(probe.current.status).toBe("loaded");
    expect(probe.current.isLoaded).toBe(true);
    expect(testCache.isLoaded("https://example.com/recupera.jpg")).toBe(true);
  });

  it("permite recarregamento manual via reload()", () => {
    testCache.setError("https://example.com/livro-recarga.jpg");

    const probe = renderBookCoverHook({
      url: "https://example.com/livro-recarga.jpg",
      cache: testCache,
      timeoutMs: 1000,
    });

    expect(probe.current.status).toBe("error");

    act(() => {
      probe.current.reload();
    });

    expect(probe.current.status).toBe("loading");
    expect(probe.current.retryCount).toBe(0);
    expect(testCache.getStatus("https://example.com/livro-recarga.jpg")).toBeUndefined();

    // Dispara timeout do reload
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(probe.current.retryCount).toBe(1);
  });

  it("chamar reload() com url vazia define status idle", () => {
    const probe = renderBookCoverHook({
      url: "",
      cache: testCache,
    });

    act(() => {
      probe.current.reload();
    });

    expect(probe.current.status).toBe("idle");
  });

  it("reage à mudança de URL resetando estado", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/url1.jpg",
      cache: testCache,
    });

    act(() => {
      probe.current.onLoad();
    });
    expect(probe.current.isLoaded).toBe(true);

    // Troca para URL 2 não cacheada
    probe.rerender({
      url: "https://example.com/url2.jpg",
      cache: testCache,
    });

    expect(probe.current.status).toBe("loading");
    expect(probe.current.isLoading).toBe(true);

    // Troca para URL vazia
    probe.rerender({
      url: "",
      cache: testCache,
    });

    expect(probe.current.status).toBe("idle");
  });

  it("limpa timers ao desmontar sem erros de estado", () => {
    const probe = renderBookCoverHook({
      url: "https://example.com/desmonta.jpg",
      cache: testCache,
      timeoutMs: 5000,
    });

    probe.unmount();

    // Avançar tempo não deve causar efeito colateral nem exceção
    expect(() => {
      vi.advanceTimersByTime(10000);
    }).not.toThrow();
  });
});
