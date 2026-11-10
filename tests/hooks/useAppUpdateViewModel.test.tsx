import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import type { AppVersionPolicy } from "@/model/entities/appUpdate";
import type { AppUpdateUseCases } from "@/usecase/appUpdateUseCases";
import { useAppUpdateViewModel } from "@/viewmodel/useAppUpdateViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length) mounted.pop()?.unmount();
  });
  vi.restoreAllMocks();
});

const samplePolicy: AppVersionPolicy = {
  platform: "android",
  latestVersion: "0.2.0",
  minSupportedVersion: "0.1.0",
  releaseNotes: "Novidades",
  storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app",
};

function createMockUseCases(overrides?: Partial<AppUpdateUseCases>): AppUpdateUseCases {
  return {
    checkUpdate: vi.fn(async () => ({ status: "optional", policy: samplePolicy })),
    dismiss: vi.fn(async () => {}),
    openStore: vi.fn(async () => true),
    evaluateStatus: vi.fn(),
  } as unknown as AppUpdateUseCases;
}

function renderHook(useCases: AppUpdateUseCases) {
  let result!: ReturnType<typeof useAppUpdateViewModel>;
  function Probe() {
    result = useAppUpdateViewModel(useCases);
    return null;
  }
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(createElement(Probe));
  });
  mounted.push(renderer);
  return {
    get current() {
      return result;
    },
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

describe("useAppUpdateViewModel", () => {
  it("desativa checagem no ambiente web", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "web";
    const useCases = createMockUseCases();
    try {
      const hook = renderHook(useCases);
      expect(hook.current.loading).toBe(false);
      expect(hook.current.status).toBe("up_to_date");
      expect(useCases.checkUpdate).not.toHaveBeenCalled();
    } finally {
      Platform.OS = originalOS;
    }
  });

  it("busca atualizacao no ambiente nativo e preenche policy", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const useCases = createMockUseCases();
    try {
      const hook = renderHook(useCases);
      expect(hook.current.loading).toBe(true);
      await act(async () => {
        await Promise.resolve();
      });
      expect(hook.current.loading).toBe(false);
      expect(hook.current.status).toBe("optional");
      expect(hook.current.policy).toEqual(samplePolicy);
    } finally {
      Platform.OS = originalOS;
    }
  });

  it("ignora dismiss quando status nao for optional", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const useCases = createMockUseCases();
    (useCases.checkUpdate as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: "required",
      policy: samplePolicy,
    });
    try {
      const hook = renderHook(useCases);
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await hook.current.dismiss();
      });
      expect(useCases.dismiss).not.toHaveBeenCalled();
      expect(hook.current.status).toBe("required");
    } finally {
      Platform.OS = originalOS;
    }
  });

  it("executa dismiss e atualiza status para up_to_date", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const useCases = createMockUseCases();
    try {
      const hook = renderHook(useCases);
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await hook.current.dismiss();
      });
      expect(useCases.dismiss).toHaveBeenCalledWith("0.2.0");
      expect(hook.current.status).toBe("up_to_date");
    } finally {
      Platform.OS = originalOS;
    }
  });

  it("abre a loja com storeUrl e nao quebra se policy for nula", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const useCases = createMockUseCases();
    try {
      const hook = renderHook(useCases);
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await hook.current.openStore();
      });
      expect(useCases.openStore).toHaveBeenCalledWith(samplePolicy.storeUrl);
    } finally {
      Platform.OS = originalOS;
    }

    // Sem policy
    Platform.OS = "android";
    const noPolicyUseCases = createMockUseCases();
    (noPolicyUseCases.checkUpdate as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: "up_to_date",
      policy: null,
    });
    try {
      const hook = renderHook(noPolicyUseCases);
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await hook.current.openStore();
      });
      expect(noPolicyUseCases.openStore).not.toHaveBeenCalled();
    } finally {
      Platform.OS = originalOS;
    }
  });
});
