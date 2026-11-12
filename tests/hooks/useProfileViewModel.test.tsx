import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(userId: string | null, useCases: IPublicProfileUseCases) {
  let result!: ReturnType<typeof useProfileViewModel>;
  function HookProbe() {
    result = useProfileViewModel(userId, useCases);
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

const profile = {
  userId: "ana",
  name: "Ana",
  joinedAt: "2026-01-01T00:00:00.000Z",
  averageRating: null,
  ratingCount: 0,
  completedNegotiations: 0,
};

describe("testes de hook: useProfileViewModel (Spec 006 / Issue #55)", () => {
  it("não carrega nada sem sessão", async () => {
    const hook = await renderHook(null, {
      getPublicProfile: vi.fn(),
      updateProfile: vi.fn(),
    });
    expect(hook.current[0]).toEqual({ profile: null, loading: false, saving: false, error: null });
  });

  it("carrega o perfil da pessoa autenticada", async () => {
    const hook = await renderHook("ana", {
      getPublicProfile: async () => profile,
      updateProfile: vi.fn(),
    });
    expect(hook.current[0]).toEqual({ profile, loading: false, saving: false, error: null });

    // Reload com DomainError
    const getProfileDomainErr = vi.fn(async () => {
      throw new ValidationError("Perfil suspenso.");
    });
    const hookReloadErr = await renderHook("ana", { getPublicProfile: getProfileDomainErr, updateProfile: vi.fn() });
    expect(hookReloadErr.current[0].error).toBe("Perfil suspenso.");
    await act(async () => {
      hookReloadErr.current[1].reload();
    });
    expect(hookReloadErr.current[0].error).toBe("Perfil suspenso.");
  });

  it("reporta erro de domínio ao carregar", async () => {
    const hook = await renderHook("ana", {
      getPublicProfile: async () => {
        throw new ValidationError("Usuário não encontrado.");
      },
      updateProfile: vi.fn(),
    });
    expect(hook.current[0]).toEqual({ profile: null, loading: false, saving: false, error: "Usuário não encontrado." });
  });

  it("atualiza o perfil com sucesso", async () => {
    const updated = { ...profile, name: "Ana Paula" };
    const updateProfile = vi.fn().mockResolvedValue(updated);
    const hook = await renderHook("ana", { getPublicProfile: async () => profile, updateProfile });
    let ok = false;
    await act(async () => {
      ok = await hook.current[1].update({ name: "Ana Paula" });
    });
    expect(ok).toBe(true);
    expect(updateProfile).toHaveBeenCalledWith("ana", { name: "Ana Paula" });
    expect(hook.current[0].profile).toEqual(updated);
  });

  it("reporta erro genérico ao salvar", async () => {
    const hook = await renderHook("ana", {
      getPublicProfile: async () => profile,
      updateProfile: async () => {
        throw new Error("boom");
      },
    });
    let ok = true;
    await act(async () => {
      ok = await hook.current[1].update({ name: "Ana Paula" });
    });
    expect(ok).toBe(false);
    expect(hook.current[0].error).toBe("Não foi possível salvar o perfil. Tente novamente.");

    // Erro de domínio ao salvar
    const hookDomain = await renderHook("ana", {
      getPublicProfile: async () => profile,
      updateProfile: async () => {
        throw new ValidationError("Nome inválido.");
      },
    });
    await act(async () => {
      ok = await hookDomain.current[1].update({ name: "X" });
    });
    expect(ok).toBe(false);
    expect(hookDomain.current[0].error).toBe("Nome inválido.");
  });

  it("não atualiza sem sessão", async () => {
    const updateProfile = vi.fn();
    const hook = await renderHook(null, { getPublicProfile: vi.fn(), updateProfile });
    let ok = true;
    await act(async () => {
      ok = await hook.current[1].update({ name: "Ana" });
    });
    expect(ok).toBe(false);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("recarrega o perfil pelo reload após falha de carregamento", async () => {
    let attempts = 0;
    const getPublicProfile = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("boom");
      return profile;
    });
    const hook = await renderHook("ana", { getPublicProfile, updateProfile: vi.fn() });
    expect(hook.current[0].error).toBe("Não foi possível carregar o perfil. Tente novamente.");
    await act(async () => {
      hook.current[1].reload();
    });
    expect(hook.current[0]).toEqual({ profile, loading: false, saving: false, error: null });

    // Reload com DomainError
    const getProfileDomainErr = vi.fn(async () => {
      throw new ValidationError("Perfil suspenso.");
    });
    const hookReloadErr = await renderHook("ana", { getPublicProfile: getProfileDomainErr, updateProfile: vi.fn() });
    expect(hookReloadErr.current[0].error).toBe("Perfil suspenso.");
    await act(async () => {
      hookReloadErr.current[1].reload();
    });
    expect(hookReloadErr.current[0].error).toBe("Perfil suspenso.");
  });

  it("não recarrega sem sessão", async () => {
    const getPublicProfile = vi.fn();
    const hook = await renderHook(null, { getPublicProfile, updateProfile: vi.fn() });
    await act(async () => {
      hook.current[1].reload();
    });
    expect(getPublicProfile).not.toHaveBeenCalled();
  });
});
