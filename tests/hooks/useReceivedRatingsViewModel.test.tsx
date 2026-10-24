import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IRatingUseCases, ReceivedRating } from "@/usecase/iRatingUseCases";
import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(
  sessionUserId: string | null,
  useCases: Partial<IRatingUseCases> & Pick<IRatingUseCases, "listReceivedRatings">,
) {
  let result!: ReturnType<typeof useReceivedRatingsViewModel>;
  function HookProbe() {
    result = useReceivedRatingsViewModel(sessionUserId, useCases as IRatingUseCases);
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

const fakeRating: ReceivedRating = {
  id: "r1",
  raterId: "ana",
  raterName: "Ana Paula",
  score: 5,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("testes de hook: useReceivedRatingsViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  it("carrega as avaliações recebidas com sucesso", async () => {
    const hook = await renderHook("bia", {
      listReceivedRatings: async () => [fakeRating],
    });

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].ratings).toEqual([fakeRating]);
    expect(hook.current[0].error).toBeNull();
  });

  it("mostra erro de domínio ao falhar", async () => {
    const hook = await renderHook("bia", {
      listReceivedRatings: async () => {
        throw new DomainError("Sessão obrigatória para ver suas avaliações.");
      },
    });

    expect(hook.current[0].error).toBe("Sessão obrigatória para ver suas avaliações.");
    expect(hook.current[0].ratings).toEqual([]);
  });

  it("recarrega ao chamar reload", async () => {
    const listReceivedRatings = vi.fn().mockResolvedValue([fakeRating]);
    const hook = await renderHook("bia", { listReceivedRatings });
    expect(listReceivedRatings).toHaveBeenCalledTimes(1);

    await act(async () => {
      await hook.current[1].reload();
    });
    expect(listReceivedRatings).toHaveBeenCalledTimes(2);
  });
});
