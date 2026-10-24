import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { useNegotiationRatingViewModel } from "@/viewmodel/useNegotiationRatingViewModel";
import type { Rating } from "@/model/entities/rating";
import type { IRatingUseCases, ReceivedRating, SubmitRatingParams } from "@/usecase/iRatingUseCases";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function createMockUseCases(existingRating: Rating | null = null): IRatingUseCases {
  let storedRating = existingRating;
  return {
    async listReceivedRatings(): Promise<readonly ReceivedRating[]> {
      return [];
    },
    async getNegotiationRating(_sessionUserId: string | null, _requestId: string): Promise<Rating | null> {
      return storedRating;
    },
    async submitRating(sessionUserId: string | null, params: SubmitRatingParams): Promise<Rating> {
      if (!sessionUserId) throw new Error("Não autenticado");
      storedRating = {
        id: "rating-test-1",
        raterId: sessionUserId,
        ratedUserId: params.ratedUserId,
        requestId: params.requestId,
        score: params.score,
        createdAt: "2026-10-23T20:00:00Z",
      };
      return storedRating;
    },
  };
}

async function renderRatingHook(
  requestId: string,
  sessionUserId: string | null,
  ratedUserId: string,
  useCases: IRatingUseCases,
) {
  let result!: ReturnType<typeof useNegotiationRatingViewModel>;
  function HookProbe() {
    result = useNegotiationRatingViewModel(requestId, sessionUserId, ratedUserId, useCases);
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

describe("Hook useNegotiationRatingViewModel (Spec 063 / ADR 0046)", () => {
  it("carrega estado inicial quando ainda não há avaliação", async () => {
    const mockUseCases = createMockUseCases(null);
    const hook = await renderRatingHook("req-1", "user-1", "user-2", mockUseCases);

    const [state] = hook.current;
    expect(state.isLoading).toBe(false);
    expect(state.userRating).toBeNull();
    expect(state.selectedScore).toBe(5);
    expect(state.error).toBeNull();
  });

  it("carrega avaliação prévia se já existir", async () => {
    const mockUseCases = createMockUseCases({
      id: "r-prev",
      raterId: "user-1",
      ratedUserId: "user-2",
      requestId: "req-1",
      score: 4,
      createdAt: "2026-10-23T19:00:00Z",
    });
    const hook = await renderRatingHook("req-1", "user-1", "user-2", mockUseCases);

    const [state] = hook.current;
    expect(state.isLoading).toBe(false);
    expect(state.userRating).not.toBeNull();
    expect(state.userRating?.score).toBe(4);
    expect(state.selectedScore).toBe(4);
  });

  it("permite alterar a nota selecionada e enviar avaliação com sucesso", async () => {
    const mockUseCases = createMockUseCases(null);
    const hook = await renderRatingHook("req-1", "user-1", "user-2", mockUseCases);

    await act(async () => {
      hook.current[1].setSelectedScore(3);
    });

    expect(hook.current[0].selectedScore).toBe(3);

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].submitRating();
    });

    expect(ok).toBe(true);
    const [state] = hook.current;
    expect(state.isSuccess).toBe(true);
    expect(state.userRating?.score).toBe(3);
    expect(state.submitError).toBeNull();
  });

  it("trata erro quando envio falha", async () => {
    const mockUseCases = {
      ...createMockUseCases(),
      async submitRating() {
        throw new Error("Erro de conexão com o banco");
      },
    };
    const hook = await renderRatingHook("req-1", "user-1", "user-2", mockUseCases);

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].submitRating();
    });

    expect(ok).toBe(false);
    const [state] = hook.current;
    expect(state.isSuccess).toBe(false);
    expect(state.submitError).toBe("Erro de conexão com o banco");
  });
});
