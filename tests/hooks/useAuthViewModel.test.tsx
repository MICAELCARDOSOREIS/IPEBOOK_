import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import { ClientRateLimiter } from "@/infra/services/clientRateLimiter";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

function silentLogger(): ILogger {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(auth: IAuthUseCases, rateLimiter?: IRateLimiter, logger?: ILogger) {
  let result!: ReturnType<typeof useAuthViewModel>;
  function HookProbe() {
    result = rateLimiter
      ? useAuthViewModel(auth, rateLimiter, logger ?? silentLogger())
      : useAuthViewModel(auth);
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
    requestPasswordReset: async () => {
      throw new Error("not implemented");
    },
    completePasswordReset: async () => {
      throw new Error("not implemented");
    },
    deleteAccount: async () => {},
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
    const hook = await renderHook(fakeAuth({ signUp, getSession: async () => user }));

    let success = false;
    await act(async () => {
      success = await hook.current[1].signUp("nova@exemplo.com", "12345678", "Leitora Teste");
    });

    expect(success).toBe(true);
    expect(hook.current[0]).toMatchObject({ user, loading: false, error: null });
  });

  it("orienta a confirmar o e-mail quando o cadastro ainda não criou sessão", async () => {
    const hook = await renderHook(fakeAuth({
      signUp: async () => ({ id: "1", email: "nova@exemplo.com" }),
      getSession: async () => null,
    }));
    let authenticated = true;
    await act(async () => {
      authenticated = await hook.current[1].signUp("nova@exemplo.com", "12345678", "Leitora Teste");
    });
    expect(authenticated).toBe(false);
    expect(hook.current[0].statusMessage).toBe("Conta criada. Confirme seu e-mail antes de entrar.");
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

  it("confirma a solicitação sem retornar uma senha", async () => {
    const hook = await renderHook(
      fakeAuth({ requestPasswordReset: async () => {} }),
    );

    let result = false;
    await act(async () => {
      result = await hook.current[1].requestPasswordReset("pessoa@exemplo.com");
    });

    expect(result).toBe(true);
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].loading).toBe(false);
  });

  it("registra erro tratável quando a recuperação de senha falha", async () => {
    const hook = await renderHook(
      fakeAuth({
        requestPasswordReset: async () => {
          throw new AuthError("Não há conta cadastrada com este e-mail.");
        },
      }),
    );

    let result = true;
    await act(async () => {
      result = await hook.current[1].requestPasswordReset("desconhecido@exemplo.com");
    });

    expect(result).toBe(false);
    expect(hook.current[0].error).toBe("Não há conta cadastrada com este e-mail.");
  });

  it("trata erro de domínio e sanitiza erro inesperado no cadastro (signUp)", async () => {
    const hookDomain = await renderHook(
      fakeAuth({
        signUp: async () => {
          throw new AuthError("E-mail já cadastrado.");
        },
      }),
    );
    let resDomain = true;
    await act(async () => {
      resDomain = await hookDomain.current[1].signUp("existente@exemplo.com", "senha123", "Leitora Teste");
    });
    expect(resDomain).toBe(false);
    expect(hookDomain.current[0].error).toBe("E-mail já cadastrado.");

    const hookUnexpected = await renderHook(
      fakeAuth({
        signUp: async () => {
          throw new Error("banco caiu");
        },
      }),
    );
    let resUnexpected = true;
    await act(async () => {
      resUnexpected = await hookUnexpected.current[1].signUp("novo@exemplo.com", "senha123", "Leitora Teste");
    });
    expect(resUnexpected).toBe(false);
    expect(hookUnexpected.current[0].error).toBe("Não foi possível concluir. Tente novamente.");
  });

  it("sanitiza erro inesperado na recuperação de senha e lida com falha no signOut", async () => {
    const hookReset = await renderHook(
      fakeAuth({
        requestPasswordReset: async () => {
          throw new Error("falha SMTP");
        },
      }),
    );
    let resReset = true;
    await act(async () => {
      resReset = await hookReset.current[1].requestPasswordReset("alguem@exemplo.com");
    });
    expect(resReset).toBe(false);
    expect(hookReset.current[0].error).toBe("Não foi possível concluir. Tente novamente.");

    const hookSignOut = await renderHook(
      fakeAuth({
        signOut: async () => {
          throw new Error("falha rede");
        },
      }),
    );
    await act(async () => {
      await hookSignOut.current[1].signOut();
    });
    expect(hookSignOut.current[0].loading).toBe(false);
  });

  it("trata falha silenciosamente na recuperação de sessão inicial", async () => {
    const hook = await renderHook(
      fakeAuth({
        getSession: async () => {
          throw new Error("storage corrompido");
        },
      }),
    );
    expect(hook.current[0].user).toBeNull();
    expect(hook.current[0].loading).toBe(false);
  });
});

describe("useAuthViewModel — limite de tentativas no cliente (ADR 0027)", () => {
  it("bloqueia a entrada depois de cinco tentativas na mesma conta e registra o aviso", async () => {
    const auth = fakeAuth({
      signIn: async () => {
        throw new AuthError("Credenciais inválidas.");
      },
    });
    const rateLimiter = new ClientRateLimiter();
    const logger = silentLogger();
    const hook = await renderHook(auth, rateLimiter, logger);

    for (let tentativa = 1; tentativa <= 5; tentativa += 1) {
      await act(async () => {
        await hook.current[1].signIn("pessoa@exemplo.com", "senha-errada");
      });
      expect(hook.current[0].error).toBe("Credenciais inválidas.");
    }

    await act(async () => {
      await hook.current[1].signIn("pessoa@exemplo.com", "senha-errada");
    });

    expect(hook.current[0].error).toMatch(/^Muitas tentativas seguidas\./);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("não mistura o limite entre contas diferentes", async () => {
    const auth = fakeAuth({
      signIn: async () => {
        throw new AuthError("Credenciais inválidas.");
      },
    });
    const rateLimiter = new ClientRateLimiter();
    const hook = await renderHook(auth, rateLimiter);

    for (let tentativa = 1; tentativa <= 5; tentativa += 1) {
      await act(async () => {
        await hook.current[1].signIn("primeira@exemplo.com", "x");
      });
    }

    await act(async () => {
      await hook.current[1].signIn("segunda@exemplo.com", "x");
    });

    expect(hook.current[0].error).toBe("Credenciais inválidas.");
  });

  it("zera o limite quando a entrada dá certo", async () => {
    let deveFalhar = true;
    const auth = fakeAuth({
      signIn: async () => {
        if (deveFalhar) throw new AuthError("Credenciais inválidas.");
        return { id: "u1", email: "pessoa@exemplo.com" };
      },
    });
    const rateLimiter = new ClientRateLimiter();
    const hook = await renderHook(auth, rateLimiter);

    for (let tentativa = 1; tentativa <= 4; tentativa += 1) {
      await act(async () => {
        await hook.current[1].signIn("pessoa@exemplo.com", "x");
      });
    }

    deveFalhar = false;
    await act(async () => {
      await hook.current[1].signIn("pessoa@exemplo.com", "certa");
    });
    expect(hook.current[0].user?.id).toBe("u1");

    deveFalhar = true;
    await act(async () => {
      await hook.current[1].signIn("pessoa@exemplo.com", "x");
    });
    expect(hook.current[0].error).toBe("Credenciais inválidas.");
  });

  it("limita o pedido de recuperação de senha a três por conta", async () => {
    const auth = fakeAuth({ requestPasswordReset: async () => {} });
    const rateLimiter = new ClientRateLimiter();
    const hook = await renderHook(auth, rateLimiter);

    for (let tentativa = 1; tentativa <= 3; tentativa += 1) {
      let ok = false;
      await act(async () => {
        ok = await hook.current[1].requestPasswordReset("pessoa@exemplo.com");
      });
      expect(ok).toBe(true);
    }

    let bloqueado = true;
    await act(async () => {
      bloqueado = await hook.current[1].requestPasswordReset("pessoa@exemplo.com");
    });

    expect(bloqueado).toBe(false);
    expect(hook.current[0].error).toMatch(/^Muitas tentativas seguidas\./);
  });

  it("bloqueia o cadastro repetido do mesmo e-mail", async () => {
    const auth = fakeAuth({
      signUp: async () => {
        throw new AuthError("Este e-mail já está em uso.");
      },
    });
    const rateLimiter = new ClientRateLimiter();
    const hook = await renderHook(auth, rateLimiter);

    for (let tentativa = 1; tentativa <= 5; tentativa += 1) {
      await act(async () => {
        await hook.current[1].signUp("pessoa@exemplo.com", "12345678", "Pessoa");
      });
    }

    await act(async () => {
      await hook.current[1].signUp("pessoa@exemplo.com", "12345678", "Pessoa");
    });

    expect(hook.current[0].error).toMatch(/^Muitas tentativas seguidas\./);
  });
});
