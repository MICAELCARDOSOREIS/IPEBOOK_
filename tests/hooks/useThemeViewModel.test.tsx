import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { __setMockColorScheme } from "../mocks/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IThemePreferenceUseCases } from "@/usecase/iThemePreferenceUseCases";
import { useThemeViewModel } from "@/viewmodel/useThemeViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: IThemePreferenceUseCases) {
  let result!: ReturnType<typeof useThemeViewModel>;
  function HookProbe() {
    result = useThemeViewModel(useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
  __setMockColorScheme("light");
});

function fakeUseCases(preference: "system" | "light" | "dark" = "system"): IThemePreferenceUseCases {
  let stored = preference;
  return {
    getPreference: vi.fn(async () => stored),
    setPreference: vi.fn(async (next) => {
      stored = next;
    }),
  };
}

describe("useThemeViewModel (Spec 044 / Issue #144)", () => {
  it("segue o tema claro do sistema quando a preferência é 'system'", async () => {
    __setMockColorScheme("light");
    const hook = await renderHook(fakeUseCases("system"));
    expect(hook.current[0]).toEqual({ preference: "system", resolvedScheme: "light", loading: false });
  });

  it("segue o tema escuro do sistema quando a preferência é 'system'", async () => {
    __setMockColorScheme("dark");
    const hook = await renderHook(fakeUseCases("system"));
    expect(hook.current[0].resolvedScheme).toBe("dark");
  });

  it("ignora o sistema quando a preferência manual é 'dark'", async () => {
    __setMockColorScheme("light");
    const hook = await renderHook(fakeUseCases("dark"));
    expect(hook.current[0].resolvedScheme).toBe("dark");
  });

  it("persiste a troca manual de preferência", async () => {
    const useCases = fakeUseCases("system");
    const hook = await renderHook(useCases);

    await act(async () => {
      await hook.current[1].setPreference("dark");
    });

    expect(hook.current[0]).toEqual({ preference: "dark", resolvedScheme: "dark", loading: false });
    expect(useCases.setPreference).toHaveBeenCalledWith("dark");
  });
});
