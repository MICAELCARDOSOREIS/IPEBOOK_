import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IBetaSignupUseCases } from "@/usecase/iBetaSignupUseCases";
import { useBetaSignupViewModel } from "@/viewmodel/useBetaSignupViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length) mounted.pop()?.unmount();
  });
});

async function probe(useCases: IBetaSignupUseCases) {
  let result!: ReturnType<typeof useBetaSignupViewModel>;
  function HookProbe() {
    result = useBetaSignupViewModel(useCases);
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

describe("useBetaSignupViewModel (Spec 108)", () => {
  it("registra inscrição no beta com sucesso e reseta estado", async () => {
    const useCases: IBetaSignupUseCases = {
      register: vi.fn().mockResolvedValue({ id: "beta-1", email: "testador@gmail.com", name: "Testador" }),
    };
    const hook = await probe(useCases);
    expect(hook.current[0]).toEqual({ loading: false, error: null, success: false });

    await act(async () => {
      await hook.current[1].submit("testador@gmail.com", "Testador");
    });
    expect(hook.current[0]).toEqual({ loading: false, error: null, success: true });
    expect(useCases.register).toHaveBeenCalledWith({ email: "testador@gmail.com", name: "Testador" });

    act(() => {
      hook.current[1].reset();
    });
    expect(hook.current[0]).toEqual({ loading: false, error: null, success: false });
  });

  it("trata DomainError e erros inesperados", async () => {
    const useCasesDomain: IBetaSignupUseCases = {
      register: vi.fn().mockRejectedValue(new DomainError("Inscrição já realizada com este e-mail.")),
    };
    const hookDomain = await probe(useCasesDomain);
    await act(async () => {
      await hookDomain.current[1].submit("duplicado@gmail.com", "Nome");
    });
    expect(hookDomain.current[0].error).toBe("Inscrição já realizada com este e-mail.");
    expect(hookDomain.current[0].success).toBe(false);

    const useCasesGeneric: IBetaSignupUseCases = {
      register: vi.fn().mockRejectedValue(new Error("Erro interno")),
    };
    const hookGeneric = await probe(useCasesGeneric);
    await act(async () => {
      await hookGeneric.current[1].submit("teste@gmail.com", "Nome");
    });
    expect(hookGeneric.current[0].error).toBe("Não foi possível registrar sua inscrição. Tente de novo.");
  });
});
