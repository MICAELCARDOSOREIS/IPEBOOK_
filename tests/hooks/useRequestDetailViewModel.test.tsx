import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IBookRequestUseCases, NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(
  requestId: string,
  sessionUserId: string | null,
  useCases: Pick<IBookRequestUseCases, "getRequestDetail">,
) {
  let result!: ReturnType<typeof useRequestDetailViewModel>;
  const loadingStates: boolean[] = [];
  function HookProbe() {
    result = useRequestDetailViewModel(requestId, sessionUserId, useCases as IBookRequestUseCases);
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

describe("testes de hook: useRequestDetailViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  const fakeDetail: NegotiationDetail = {
    request: {
      id: "req-1",
      listingId: "book-1",
      requesterId: "user-buyer",
      status: "accepted",
    },
    book: {
      id: "book-1",
      title: "O Quinze",
      author: "Rachel de Queiroz",
      modality: "trade",
      ownerId: "user-seller",
      status: "reserved",
    },
    isOwner: true,
    counterpartId: "user-buyer",
    safeMeetingPoints: ["Campus IFPI"],
  };

  it("carrega os detalhes da negociação com sucesso", async () => {
    const hook = await renderHook("req-1", "user-seller", {
      getRequestDetail: async () => fakeDetail,
    });

    expect(hook.loadingStates).toContain(true);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].detail).toEqual(fakeDetail);
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro de domínio e permite recarregar", async () => {
    const getRequestDetail = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Permissão negada."))
      .mockResolvedValueOnce(fakeDetail);

    const hook = await renderHook("req-1", "user-seller", { getRequestDetail });
    expect(hook.current[0].error).toBe("Permissão negada.");
    expect(hook.current[0].loading).toBe(false);

    await act(async () => {
      await hook.current[1].reload();
    });

    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].detail).toEqual(fakeDetail);
  });

  it("mascara erros inesperados com mensagem segura", async () => {
    const hook = await renderHook("req-1", "user-seller", {
      getRequestDetail: async () => {
        throw new Error("Fatal 500");
      },
    });

    expect(hook.current[0].error).toBe(
      "Não foi possível carregar os detalhes da negociação. Tente novamente.",
    );
    expect(hook.current[0].loading).toBe(false);
  });
});
