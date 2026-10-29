import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(userId: string | null, useCases: IUserPreferencesUseCases) {
  let result!: ReturnType<typeof useUserPreferencesViewModel>;
  function HookProbe() {
    result = useUserPreferencesViewModel(userId, useCases);
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
});

const preferences = { userId: "ana", phone: "86999998888", neighborhood: "Centro" as const };

describe("testes de hook: useUserPreferencesViewModel (Spec 034 / Issue #141)", () => {
  it("não carrega nada sem sessão", async () => {
    const hook = await renderHook(null, { getPreferences: vi.fn(), updatePreferences: vi.fn() });
    expect(hook.current[0]).toEqual({ preferences: null, loading: false, saving: false, error: null });
  });

  it("carrega as preferências da pessoa autenticada", async () => {
    const hook = await renderHook("ana", { getPreferences: async () => preferences, updatePreferences: vi.fn() });
    expect(hook.current[0]).toEqual({ preferences, loading: false, saving: false, error: null });
  });

  it("reporta erro de domínio ao carregar", async () => {
    const hook = await renderHook("ana", {
      getPreferences: async () => {
        throw new ValidationError("Usuário não encontrado.");
      },
      updatePreferences: vi.fn(),
    });
    expect(hook.current[0]).toEqual({ preferences: null, loading: false, saving: false, error: "Usuário não encontrado." });
  });

  it("atualiza as preferências com sucesso", async () => {
    const updated = { ...preferences, phone: "86988887777" };
    const updatePreferences = vi.fn().mockResolvedValue(updated);
    const hook = await renderHook("ana", { getPreferences: async () => preferences, updatePreferences });
    let ok = false;
    await act(async () => {
      ok = await hook.current[1].update({ phone: "86988887777" });
    });
    expect(ok).toBe(true);
    expect(updatePreferences).toHaveBeenCalledWith("ana", { phone: "86988887777" });
    expect(hook.current[0].preferences).toEqual(updated);
  });

  it("reporta erro genérico ao salvar", async () => {
    const hook = await renderHook("ana", {
      getPreferences: async () => preferences,
      updatePreferences: async () => {
        throw new Error("boom");
      },
    });
    let ok = true;
    await act(async () => {
      ok = await hook.current[1].update({ phone: "86988887777" });
    });
    expect(ok).toBe(false);
    expect(hook.current[0].error).toBe("Não foi possível salvar suas preferências. Tente novamente.");
  });

  it("não atualiza sem sessão", async () => {
    const updatePreferences = vi.fn();
    const hook = await renderHook(null, { getPreferences: vi.fn(), updatePreferences });
    let ok = true;
    await act(async () => {
      ok = await hook.current[1].update({ phone: "86988887777" });
    });
    expect(ok).toBe(false);
    expect(updatePreferences).not.toHaveBeenCalled();
  });
});
