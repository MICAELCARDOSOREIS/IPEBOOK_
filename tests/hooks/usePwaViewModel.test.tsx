import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IPwaService } from "@/model/services/iPwaService";
import { usePwaViewModel, type UsePwaViewModelOptions } from "@/viewmodel/usePwaViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function createMockPwaService(overrides: Partial<IPwaService> = {}): IPwaService {
  return {
    isSupported: vi.fn().mockReturnValue(true),
    register: vi.fn().mockResolvedValue(true),
    unregister: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

afterEach(() => {
  while (mounted.length) {
    const renderer = mounted.pop();
    act(() => renderer?.unmount());
  }
});

async function renderPwaHook(options: UsePwaViewModelOptions = {}) {
  let hookResult!: ReturnType<typeof usePwaViewModel>;
  function Probe() {
    hookResult = usePwaViewModel(options);
    return null;
  }
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(Probe));
  });
  mounted.push(renderer);
  return {
    get current() {
      return hookResult;
    },
    unmount: () => {
      act(() => renderer.unmount());
    },
  };
}

describe("usePwaViewModel (Spec 041, ADR 0035)", () => {
  it("auto-registra na montagem quando suportado e autoRegister for true", async () => {
    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockResolvedValue(true),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: true });

    expect(probe.current.isSupported).toBe(true);
    expect(mockService.register).toHaveBeenCalledTimes(1);
    expect(probe.current.isRegistered).toBe(true);
  });

  it("não auto-registra quando isSupported for false", async () => {
    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(false),
      register: vi.fn().mockResolvedValue(false),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: true });

    expect(probe.current.isSupported).toBe(false);
    expect(mockService.register).not.toHaveBeenCalled();
    expect(probe.current.isRegistered).toBe(false);
  });

  it("não auto-registra quando autoRegister for explicitamente false", async () => {
    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockResolvedValue(true),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: false });

    expect(probe.current.isSupported).toBe(true);
    expect(mockService.register).not.toHaveBeenCalled();
    expect(probe.current.isRegistered).toBe(false);
  });

  it("permite registrar manualmente via register()", async () => {
    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockResolvedValue(true),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: false });
    expect(probe.current.isRegistered).toBe(false);

    let result!: boolean;
    await act(async () => {
      result = await probe.current.register();
    });

    expect(result).toBe(true);
    expect(probe.current.isRegistered).toBe(true);
    expect(mockService.register).toHaveBeenCalledTimes(1);
  });

  it("permite desregistrar via unregister() e atualiza estado", async () => {
    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockResolvedValue(true),
      unregister: vi.fn().mockResolvedValue(true),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: true });
    expect(probe.current.isRegistered).toBe(true);

    let result!: boolean;
    await act(async () => {
      result = await probe.current.unregister();
    });

    expect(result).toBe(true);
    expect(probe.current.isRegistered).toBe(false);
    expect(mockService.unregister).toHaveBeenCalledTimes(1);
  });

  it("não altera estado se o componente for desmontado antes da resposta da promise", async () => {
    let resolveRegister!: (val: boolean) => void;
    const pendingPromise = new Promise<boolean>((resolve) => {
      resolveRegister = resolve;
    });

    const mockService = createMockPwaService({
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockReturnValue(pendingPromise),
    });

    const probe = await renderPwaHook({ pwaService: mockService, autoRegister: true });
    probe.unmount();

    // Resolve a promise após desmontagem
    await act(async () => {
      resolveRegister(true);
    });

    // Não deve lançar erro nem vazar memória
    expect(mockService.register).toHaveBeenCalledTimes(1);
  });
});
