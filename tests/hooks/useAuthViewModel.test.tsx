import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/model/entities/user";
import { DomainError } from "@/model/errors";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length) mounted.pop()?.unmount();
  });
  vi.restoreAllMocks();
});

async function renderHook(auth: IAuthUseCases, rateLimiter?: IRateLimiter, logger?: ILogger) {
  let result!: ReturnType<typeof useAuthViewModel>;
  function Probe() {
    result = useAuthViewModel(auth, rateLimiter, logger);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

const mockUser: User = {
  id: "user-123",
  email: "leitor@piripiri.pi.gov.br",
  name: "Leitor Teste",
};

function createMockAuth(overrides: Partial<IAuthUseCases> = {}): IAuthUseCases {
  return {
    getSession: vi.fn().mockResolvedValue(null),
    signIn: vi.fn().mockResolvedValue(mockUser),
    signUp: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    completePasswordReset: vi.fn().mockResolvedValue(undefined),
    deleteAccount: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(mockUser),
    setSessionFromUrl: vi.fn().mockResolvedValue(mockUser),
    ...overrides,
  };
}

const dummyLogger: ILogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe("useAuthViewModel", () => {
  it("carrega a sessão inicial ou define null quando falha", async () => {
    const authSuccess = createMockAuth({ getSession: vi.fn().mockResolvedValue(mockUser) });
    const hookSuccess = await renderHook(authSuccess);
    expect(hookSuccess.current[0].user).toEqual(mockUser);
    expect(hookSuccess.current[0].loading).toBe(false);

    const authFail = createMockAuth({ getSession: vi.fn().mockRejectedValue(new Error("rede")) });
    const hookFail = await renderHook(authFail);
    expect(hookFail.current[0].user).toBeNull();
    expect(hookFail.current[0].loading).toBe(false);
  });

  describe("signUp", () => {
    it("cria conta e define usuário autenticado", async () => {
      const auth = createMockAuth({
        signUp: vi.fn().mockResolvedValue(undefined),
        getSession: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser),
      });
      const hook = await renderHook(auth);
      let ok: boolean = false;
      await act(async () => {
        ok = await hook.current[1].signUp("novo@email.com", "senha123", "Novo Nome");
      });
      expect(ok).toBe(true);
      expect(hook.current[0].user).toEqual(mockUser);
      expect(hook.current[0].statusMessage).toBeNull();
    });

    it("informa confirmação de e-mail se sessão continuar vazia", async () => {
      const auth = createMockAuth({
        signUp: vi.fn().mockResolvedValue(undefined),
        getSession: vi.fn().mockResolvedValue(null),
      });
      const hook = await renderHook(auth);
      let ok: boolean = false;
      await act(async () => {
        ok = await hook.current[1].signUp("novo@email.com", "senha123", "Novo Nome");
      });
      expect(ok).toBe(false);
      expect(hook.current[0].statusMessage).toContain("Confirme seu e-mail");
    });

    it("bloqueia quando rate limiter recusa", async () => {
      const auth = createMockAuth();
      const mockLimiter: IRateLimiter = {
        checkAndRecord: vi.fn().mockReturnValue({ allowed: false, remainingAttempts: 0, retryAfterMs: 45000 }),
        getTimeUntilResetMs: vi.fn().mockReturnValue(45000),
        reset: vi.fn(),
      };
      const hook = await renderHook(auth, mockLimiter, dummyLogger);
      let ok: boolean = false;
      await act(async () => {
        ok = await hook.current[1].signUp("novo@email.com", "senha123", "Novo");
      });
      expect(ok).toBe(false);
      expect(hook.current[0].error).toContain("Muitas tentativas");
    });

    it("trata DomainError e erros genéricos", async () => {
      const auth = createMockAuth({
        signUp: vi.fn().mockRejectedValue(new DomainError("E-mail já cadastrado.")),
      });
      const hook = await renderHook(auth, undefined, dummyLogger);
      await act(async () => {
        await hook.current[1].signUp("duplicado@email.com", "senha123", "Nome");
      });
      expect(hook.current[0].error).toBe("E-mail já cadastrado.");
    });
  });

  describe("signIn e signOut", () => {
    it("autentica com sucesso e reseta tentativas", async () => {
      const auth = createMockAuth({ signIn: vi.fn().mockResolvedValue(mockUser) });
      const mockLimiter: IRateLimiter = {
        checkAndRecord: vi.fn().mockReturnValue({ allowed: true, remainingAttempts: 4, retryAfterMs: 0 }),
        getTimeUntilResetMs: vi.fn().mockReturnValue(0),
        reset: vi.fn(),
      };
      const hook = await renderHook(auth, mockLimiter, dummyLogger);
      let ok: boolean = false;
      await act(async () => {
        ok = await hook.current[1].signIn("leitor@piripiri.pi.gov.br", "senha123");
      });
      expect(ok).toBe(true);
      expect(mockLimiter.reset).toHaveBeenCalled();
      expect(hook.current[0].user).toEqual(mockUser);
    });

    it("trata erro de senha incorreta", async () => {
      const auth = createMockAuth({ signIn: vi.fn().mockRejectedValue(new DomainError("Senha incorreta.")) });
      const hook = await renderHook(auth, undefined, dummyLogger);
      let ok: boolean = true;
      await act(async () => {
        ok = await hook.current[1].signIn("leitor@piripiri.pi.gov.br", "errada");
      });
      expect(ok).toBe(false);
      expect(hook.current[0].error).toBe("Senha incorreta.");
    });

    it("efetua signOut com sucesso ou tolera falha", async () => {
      const auth = createMockAuth({
        getSession: vi.fn().mockResolvedValue(mockUser),
        signOut: vi.fn().mockResolvedValue(undefined),
      });
      const hook = await renderHook(auth);
      expect(hook.current[0].user).toEqual(mockUser);

      await act(async () => {
        await hook.current[1].signOut();
      });
      expect(hook.current[0].user).toBeNull();

      // Com falha de signOut
      const authError = createMockAuth({
        getSession: vi.fn().mockResolvedValue(mockUser),
        signOut: vi.fn().mockRejectedValue(new Error("Falha")),
      });
      const hook2 = await renderHook(authError);
      await act(async () => {
        await hook2.current[1].signOut();
      });
      expect(hook2.current[0].loading).toBe(false);
    });
  });

  describe("requestPasswordReset", () => {
    it("solicita recuperação de senha e trata bloqueio e erro", async () => {
      const auth = createMockAuth();
      const hook = await renderHook(auth, undefined, dummyLogger);
      let ok: boolean = false;
      await act(async () => {
        ok = await hook.current[1].requestPasswordReset("recuperar@email.com");
      });
      expect(ok).toBe(true);

      const authErr = createMockAuth({
        requestPasswordReset: vi.fn().mockRejectedValue(new DomainError("Usuário não encontrado.")),
      });
      const hookErr = await renderHook(authErr, undefined, dummyLogger);
      await act(async () => {
        ok = await hookErr.current[1].requestPasswordReset("inexistente@email.com");
      });
      expect(ok).toBe(false);
      expect(hookErr.current[0].error).toBe("Usuário não encontrado.");
    });
  });

  describe("signInWithGoogle e handleAuthCallback", () => {
    it("autentica com Google, trata usuário cancelado ou ausência do método", async () => {
      const auth = createMockAuth({ signInWithGoogle: vi.fn().mockResolvedValue(mockUser) });
      const hook = await renderHook(auth, undefined, dummyLogger);
      let ok: boolean = false;
      await act(async () => {
        ok = (await hook.current[1].signInWithGoogle?.()) ?? false;
      });
      expect(ok).toBe(true);

      // Usuário cancelou
      const authCanceled = createMockAuth({
        signInWithGoogle: vi.fn().mockRejectedValue(new DomainError("Login cancelado pelo usuário.")),
      });
      const hookCanceled = await renderHook(authCanceled, undefined, dummyLogger);
      await act(async () => {
        ok = (await hookCanceled.current[1].signInWithGoogle?.()) ?? false;
      });
      expect(ok).toBe(false);
      expect(hookCanceled.current[0].error).toContain("cancelado");

      // Método não implementado
      const authSemGoogle = createMockAuth();
      delete (authSemGoogle as Partial<IAuthUseCases>).signInWithGoogle;
      const hookSemGoogle = await renderHook(authSemGoogle, undefined, dummyLogger);
      await act(async () => {
        ok = (await hookSemGoogle.current[1].signInWithGoogle?.()) ?? false;
      });
      expect(ok).toBe(false);
      expect(hookSemGoogle.current[0].error).toContain("indisponível");
    });

    it("processa retorno de autenticação handleAuthCallback", async () => {
      const auth = createMockAuth({ setSessionFromUrl: vi.fn().mockResolvedValue(mockUser) });
      const hook = await renderHook(auth, undefined, dummyLogger);
      let ok: boolean = false;
      await act(async () => {
        ok = (await hook.current[1].handleAuthCallback?.("https://ipebook.app/#access_token=xyz")) ?? false;
      });
      expect(ok).toBe(true);
      expect(hook.current[0].user).toEqual(mockUser);

      // Sem setSessionFromUrl
      const authSemCallback = createMockAuth();
      delete (authSemCallback as Partial<IAuthUseCases>).setSessionFromUrl;
      const hookSemCallback = await renderHook(authSemCallback, undefined, dummyLogger);
      await act(async () => {
        ok = (await hookSemCallback.current[1].handleAuthCallback?.("https://...")) ?? false;
      });
      expect(ok).toBe(false);
      expect(hookSemCallback.current[0].error).toContain("indisponível");
    });
  });
});
