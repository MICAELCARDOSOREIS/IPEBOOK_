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
    expect(hook.current[0]).toEqual({ preferences: null, pushToken: null, loading: false, saving: false, error: null });
  });

  it("carrega as preferências da pessoa autenticada", async () => {
    const hook = await renderHook("ana", { getPreferences: async () => preferences, updatePreferences: vi.fn() });
    expect(hook.current[0]).toEqual({ preferences, pushToken: null, loading: false, saving: false, error: null });
  });

  it("reporta erro de domínio ao carregar", async () => {
    const hook = await renderHook("ana", {
      getPreferences: async () => {
        throw new ValidationError("Usuário não encontrado.");
      },
      updatePreferences: vi.fn(),
    });
    expect(hook.current[0]).toEqual({
      preferences: null,
      pushToken: null,
      loading: false,
      saving: false,
      error: "Usuário não encontrado.",
    });
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

  it("recarrega as preferências pelo reload após falha de carregamento", async () => {
    let attempts = 0;
    const getPreferences = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("boom");
      return preferences;
    });
    const hook = await renderHook("ana", { getPreferences, updatePreferences: vi.fn() });
    expect(hook.current[0].error).toBe("Não foi possível carregar suas preferências. Tente novamente.");
    await act(async () => {
      hook.current[1].reload();
    });
    expect(hook.current[0]).toEqual({ preferences, pushToken: null, loading: false, saving: false, error: null });
  });

  it("carrega o pushToken salvo nas preferências no estado do ViewModel", async () => {
    const preferencesWithToken = {
      ...preferences,
      pushToken: "ExponentPushToken[sample-token-123]",
    };
    const hook = await renderHook("ana", {
      getPreferences: async () => preferencesWithToken,
      updatePreferences: vi.fn(),
    });
    expect(hook.current[0].pushToken).toBe("ExponentPushToken[sample-token-123]");
    expect(hook.current[0].preferences?.pushToken).toBe("ExponentPushToken[sample-token-123]");
  });

  it("setPushToken atualiza o token remoto com sucesso", async () => {
    const updated = {
      ...preferences,
      pushToken: "ExponentPushToken[sample-token-456]",
    };
    const updatePreferences = vi.fn().mockResolvedValue(updated);
    const hook = await renderHook("ana", {
      getPreferences: async () => preferences,
      updatePreferences,
    });

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].setPushToken!("ExponentPushToken[sample-token-456]");
    });

    expect(ok).toBe(true);
    expect(updatePreferences).toHaveBeenCalledWith("ana", {
      pushToken: "ExponentPushToken[sample-token-456]",
    });
    expect(hook.current[0].pushToken).toBe("ExponentPushToken[sample-token-456]");
  });

  it("setPushToken permite desregistrar token remoto passando null", async () => {
    const updated = {
      ...preferences,
      pushToken: null,
    };
    const updatePreferences = vi.fn().mockResolvedValue(updated);
    const hook = await renderHook("ana", {
      getPreferences: async () => ({ ...preferences, pushToken: "ExponentPushToken[antigo]" }),
      updatePreferences,
    });

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].setPushToken!(null);
    });

    expect(ok).toBe(true);
    expect(updatePreferences).toHaveBeenCalledWith("ana", { pushToken: null });
    expect(hook.current[0].pushToken).toBeNull();
  });

  it("setPushToken retorna false quando não autenticado", async () => {
    const updatePreferences = vi.fn();
    const hook = await renderHook(null, { getPreferences: vi.fn(), updatePreferences });
    let ok = true;
    await act(async () => {
      ok = await hook.current[1].setPushToken!("ExponentPushToken[xyz]");
    });
    expect(ok).toBe(false);
    expect(updatePreferences).not.toHaveBeenCalled();
  });
});
