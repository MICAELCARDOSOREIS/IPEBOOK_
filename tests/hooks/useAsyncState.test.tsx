import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import { useAsyncState, type UseAsyncStateResult } from "@/viewmodel/useAsyncState";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  while (mounted.length) {
    const renderer = mounted.pop();
    act(() => renderer?.unmount());
  }
});

function renderAsyncState<T>(initial: T) {
  let hookResult!: UseAsyncStateResult<T>;
  function Probe() {
    hookResult = useAsyncState(initial);
    return null;
  }
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(createElement(Probe)); });
  mounted.push(renderer);
  return {
    get current() { return hookResult; },
  };
}

describe("useAsyncState (Spec 021, Issue #76)", () => {
  it("começa com o dado inicial, sem loading nem erro", () => {
    const probe = renderAsyncState<string[]>([]);
    expect(probe.current.data).toEqual([]);
    expect(probe.current.loading).toBe(false);
    expect(probe.current.error).toBeNull();
  });

  it("marca loading durante a execução e retorna o dado ao resolver", async () => {
    const probe = renderAsyncState<number>(0);
    let resolveFn!: (value: number) => void;
    const pending = new Promise<number>((resolve) => { resolveFn = resolve; });

    let runPromise!: Promise<number | undefined>;
    act(() => { runPromise = probe.current.run(() => pending); });
    expect(probe.current.loading).toBe(true);
    expect(probe.current.error).toBeNull();

    await act(async () => { resolveFn(42); await runPromise; });
    expect(probe.current.loading).toBe(false);
    expect(probe.current.data).toBe(42);
    expect(probe.current.error).toBeNull();
  });

  it("captura DomainError e expõe a mensagem amigável", async () => {
    const probe = renderAsyncState<number>(0);
    await act(async () => {
      await probe.current.run(() => Promise.reject(new ValidationError("Termo inválido.")));
    });
    expect(probe.current.loading).toBe(false);
    expect(probe.current.error).toBe("Termo inválido.");
  });

  it("usa mensagem genérica para erros que não são DomainError", async () => {
    const probe = renderAsyncState<number>(0);
    await act(async () => {
      await probe.current.run(() => Promise.reject(new Error("falha de rede crua")));
    });
    expect(probe.current.error).toBe("Não foi possível completar a operação.");
  });

  it("limpa o erro anterior ao iniciar uma nova execução", async () => {
    const probe = renderAsyncState<number>(0);
    await act(async () => {
      await probe.current.run(() => Promise.reject(new ValidationError("Erro 1")));
    });
    expect(probe.current.error).toBe("Erro 1");

    const onCall = vi.fn().mockResolvedValue(7);
    await act(async () => {
      await probe.current.run(onCall);
    });
    expect(probe.current.error).toBeNull();
    expect(probe.current.data).toBe(7);
  });
});
