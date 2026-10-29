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
});
