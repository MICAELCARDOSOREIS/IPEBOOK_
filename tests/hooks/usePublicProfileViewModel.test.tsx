import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { PublicProfile } from "@/model/entities/publicProfile";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(userId: string, useCases: IPublicProfileUseCases) {
  let result!: ReturnType<typeof usePublicProfileViewModel>;
  const loadingStates: boolean[] = [];
  function HookProbe() {
    result = usePublicProfileViewModel(userId, useCases);
    loadingStates.push(result[0].loading);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
    loadingStates,
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("testes de hook: usePublicProfileViewModel (spec 018)", () => {
  const fakeProfile: PublicProfile = {
    userId: "ana",
    name: "Ana Paula",
    joinedAt: "2026-01-10T00:00:00.000Z",
    averageRating: 4.5,
    ratingCount: 2,
    completedNegotiations: 3,
  };

  it("carrega o perfil público com sucesso", async () => {
    const hook = await renderHook("ana", { getPublicProfile: async () => fakeProfile });

    expect(hook.loadingStates).toContain(true);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].profile).toEqual(fakeProfile);
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro de domínio e permite recarregar", async () => {
    const getPublicProfile = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Usuário não encontrado."))
      .mockResolvedValueOnce(fakeProfile);

    const hook = await renderHook("ana", { getPublicProfile });
    expect(hook.current[0].error).toBe("Usuário não encontrado.");
    expect(hook.current[0].loading).toBe(false);

    await act(async () => {
      await hook.current[1].reload();
    });

    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].profile).toEqual(fakeProfile);
  });

  it("mascara erros inesperados com mensagem segura", async () => {
    const hook = await renderHook("ana", {
      getPublicProfile: async () => {
        throw new Error("Fatal 500");
      },
    });

    expect(hook.current[0].error).toBe("Não foi possível carregar o perfil. Tente novamente.");
    expect(hook.current[0].loading).toBe(false);
  });
});
