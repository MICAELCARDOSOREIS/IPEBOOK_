import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(auth: IAuthUseCases) {
  let result!: ReturnType<typeof useAuthViewModel>;
  function HookProbe() {
    result = useAuthViewModel(auth);
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

function fakeAuth(overrides: Partial<IAuthUseCases> = {}): IAuthUseCases {
  return {
    signUp: async () => {
      throw new Error("not implemented");
    },
    signIn: async () => {
      throw new Error("not implemented");
    },
    signOut: async () => {},
    getSession: async () => null,
    ...overrides,
  };
}

describe("testes de hook: useAuthViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  it("inicia sem sessão quando não há conta autenticada", async () => {
    const hook = await renderHook(fakeAuth());
    expect(hook.current[0]).toEqual({ user: null, loading: false, error: null });
  });

  it("recupera sessão já autenticada ao montar", async () => {
    const user = { id: "1", email: "pessoa@exemplo.com" };
    const hook = await renderHook(fakeAuth({ getSession: async () => user }));
    expect(hook.current[0].user).toEqual(user);
  });

  it("cria conta com sucesso e autentica a sessão", async () => {
    const user = { id: "1", email: "nova@exemplo.com" };
    const signUp = vi.fn().mockResolvedValue(user);
    const hook = await renderHook(fakeAuth({ signUp }));

    let success = false;
    await act(async () => {
      success = await hook.current[1].signUp("nova@exemplo.com", "12345678");
    });

    expect(success).toBe(true);
    expect(hook.current[0]).toEqual({ user, loading: false, error: null });
  });

  it("trata erro de domínio ao falhar o login e permite nova tentativa", async () => {
    const signIn = vi
      .fn()
      .mockRejectedValueOnce(new AuthError("Credenciais inválidas."))
      .mockResolvedValueOnce({ id: "1", email: "pessoa@exemplo.com" });
    const hook = await renderHook(fakeAuth({ signIn }));

    let firstAttempt = true;
    await act(async () => {
      firstAttempt = await hook.current[1].signIn("pessoa@exemplo.com", "errada");
    });
    expect(firstAttempt).toBe(false);
    expect(hook.current[0].error).toBe("Credenciais inválidas.");

    let secondAttempt = false;
    await act(async () => {
      secondAttempt = await hook.current[1].signIn("pessoa@exemplo.com", "12345678");
    });
    expect(secondAttempt).toBe(true);
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].user).toEqual({ id: "1", email: "pessoa@exemplo.com" });
  });

  it("sanitiza exceções técnicas inesperadas protegendo detalhes internos", async () => {
    const hook = await renderHook(
      fakeAuth({
        signIn: async () => {
          throw new Error("conexão interna recusada: 5432");
        },
      }),
    );

    await act(async () => {
      await hook.current[1].signIn("pessoa@exemplo.com", "12345678");
    });

    expect(hook.current[0].error).toBe("Não foi possível concluir. Tente novamente.");
  });

  it("encerra a sessão ao sair", async () => {
    const user = { id: "1", email: "pessoa@exemplo.com" };
    const hook = await renderHook(fakeAuth({ getSession: async () => user }));
    expect(hook.current[0].user).toEqual(user);

    await act(async () => {
      await hook.current[1].signOut();
    });

    expect(hook.current[0].user).toBeNull();
  });
});
