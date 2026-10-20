import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function stubNetworkStatus(overrides: Partial<INetworkStatusDataSource> = {}): INetworkStatusDataSource {
  return {
    isOnline: vi.fn().mockResolvedValue(true),
    subscribe: vi.fn().mockReturnValue(() => {}),
    ...overrides,
  };
}

afterEach(() => {
  while (mounted.length) {
    const renderer = mounted.pop();
    act(() => renderer?.unmount());
  }
  vi.resetModules();
  vi.doUnmock("@/di/container");
});

async function renderNetworkStatus(dataSource: INetworkStatusDataSource) {
  vi.doMock("@/di/container", () => ({ networkStatusDataSource: dataSource }));
  const { useNetworkStatus } = await import("@/viewmodel/useNetworkStatus");
  let hookResult: { isOnline: boolean } | undefined;
  function Probe() {
    hookResult = useNetworkStatus();
    return null;
  }
  let renderer!: ReactTestRenderer;
  await act(async () => { renderer = create(createElement(Probe)); });
  mounted.push(renderer);
  return {
    get current() { return hookResult!; },
    rerender: async () => { await act(async () => renderer.update(createElement(Probe))); },
  };
}

describe("useNetworkStatus (Spec 021, Issue #76)", () => {
  it("começa online e consulta o datasource ao montar", async () => {
    const dataSource = stubNetworkStatus();
    const probe = await renderNetworkStatus(dataSource);
    expect(probe.current.isOnline).toBe(true);
    expect(dataSource.isOnline).toHaveBeenCalledTimes(1);
    expect(dataSource.subscribe).toHaveBeenCalledTimes(1);
  });

  it("reporta offline quando o datasource resolve isOnline como falso", async () => {
    const dataSource = stubNetworkStatus({ isOnline: vi.fn().mockResolvedValue(false) });
    const probe = await renderNetworkStatus(dataSource);
    expect(probe.current.isOnline).toBe(false);
  });

  it("atualiza em tempo real quando o datasource notifica mudança via subscribe", async () => {
    let notify: ((online: boolean) => void) | undefined;
    const dataSource = stubNetworkStatus({
      subscribe: vi.fn((onChange: (online: boolean) => void) => {
        notify = onChange;
        return () => {};
      }),
    });
    const probe = await renderNetworkStatus(dataSource);
    expect(probe.current.isOnline).toBe(true);

    await act(async () => { notify?.(false); });
    expect(probe.current.isOnline).toBe(false);

    await act(async () => { notify?.(true); });
    expect(probe.current.isOnline).toBe(true);
  });

  it("cancela a inscrição ao desmontar", async () => {
    const unsubscribe = vi.fn();
    const dataSource = stubNetworkStatus({ subscribe: vi.fn().mockReturnValue(unsubscribe) });
    await renderNetworkStatus(dataSource);
    const renderer = mounted.pop();
    act(() => renderer?.unmount());
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("ignora respostas tardias do datasource e do subscribe após desmontar, sem lançar erro", async () => {
    let resolveIsOnline!: (value: boolean) => void;
    let notifyAfterUnmount: ((online: boolean) => void) | undefined;
    const dataSource = stubNetworkStatus({
      isOnline: vi.fn(() => new Promise<boolean>((resolve) => { resolveIsOnline = resolve; })),
      subscribe: vi.fn((onChange: (online: boolean) => void) => {
        notifyAfterUnmount = onChange;
        return () => {};
      }),
    });
    const probe = await renderNetworkStatus(dataSource);
    const renderer = mounted.pop();
    act(() => renderer?.unmount());

    expect(() => {
      resolveIsOnline(false);
      notifyAfterUnmount?.(false);
    }).not.toThrow();
    expect(probe.current.isOnline).toBe(true);
  });
});
