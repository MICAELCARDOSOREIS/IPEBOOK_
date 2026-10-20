import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { useDeleteAccountViewModel } from "@/viewmodel/useDeleteAccountViewModel";

function stubHistory(overrides: Partial<ISearchHistoryUseCases> = {}): ISearchHistoryUseCases {
  return {
    listTerms: vi.fn().mockResolvedValue([]),
    registerSearch: vi.fn().mockResolvedValue([]),
    clearHistory: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function stubAuth(overrides: Partial<IAuthUseCases> = {}): IAuthUseCases {
  return {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null),
    requestPasswordReset: vi.fn(),
    completePasswordReset: vi.fn(),
    deleteAccount: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function renderHook(auth: IAuthUseCases, history: ISearchHistoryUseCases = stubHistory()) {
  let result!: ReturnType<typeof useDeleteAccountViewModel>;
  function HookProbe() {
    result = useDeleteAccountViewModel(auth, history);
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
  while (mounted.length > 0) {
    const r = mounted.pop();
    await act(async () => {
      r?.unmount();
    });
  }
});

describe("useDeleteAccountViewModel", () => {
  it("inicia com estado padrão limpo", async () => {
    const hook = await renderHook(stubAuth());
    const [state] = hook.current;

    expect(state.confirmed).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
  });

  it("atualiza confirmação de exclusão", async () => {
    const hook = await renderHook(stubAuth());

    await act(async () => {
      hook.current[1].setConfirmed(true);
    });

    expect(hook.current[0].confirmed).toBe(true);
  });

  it("rejeita exclusão se a sessão for nula", async () => {
    const hook = await renderHook(stubAuth());

    let result = false;
    await act(async () => {
      result = await hook.current[1].deleteAccount(null);
    });

    expect(result).toBe(false);
    expect(hook.current[0].error).toBe("Você precisa estar conectado para excluir a conta.");
  });

  it("rejeita exclusão se o usuário não tiver confirmado explicitamente", async () => {
    const hook = await renderHook(stubAuth());

    let result = false;
    await act(async () => {
      result = await hook.current[1].deleteAccount("user-1");
    });

    expect(result).toBe(false);
    expect(hook.current[0].error).toBe(
      "Você deve confirmar que compreende as consequências da exclusão.",
    );
  });

  it("exclui conta com sucesso quando autenticado e confirmado", async () => {
    const auth = stubAuth();
    const hook = await renderHook(auth);

    await act(async () => {
      hook.current[1].setConfirmed(true);
    });

    let result = false;
    await act(async () => {
      result = await hook.current[1].deleteAccount("user-1");
    });

    expect(result).toBe(true);
    expect(hook.current[0].success).toBe(true);
    expect(hook.current[0].error).toBeNull();
    expect(auth.deleteAccount).toHaveBeenCalledWith("user-1");
  });

  it("limpa o histórico de buscas da conta ao excluí-la com sucesso", async () => {
    const auth = stubAuth();
    const history = stubHistory();
    const hook = await renderHook(auth, history);

    await act(async () => { hook.current[1].setConfirmed(true); });
    await act(async () => { await hook.current[1].deleteAccount("user-1"); });

    expect(history.clearHistory).toHaveBeenCalledWith("user-1");
  });

  it("trata erro de domínio lançado pelo caso de uso", async () => {
    const auth = stubAuth({
      deleteAccount: vi.fn().mockRejectedValue(new DomainError("Serviço indisponível.")),
    });
    const hook = await renderHook(auth);

    await act(async () => {
      hook.current[1].setConfirmed(true);
    });

    let result = true;
    await act(async () => {
      result = await hook.current[1].deleteAccount("user-1");
    });

    expect(result).toBe(false);
    expect(hook.current[0].error).toBe("Serviço indisponível.");
    expect(hook.current[0].success).toBe(false);
  });

  it("baixa dados do usuário com sucesso via downloadUserData (Spec 029 - LGPD)", async () => {
    const auth = stubAuth();
    const mockExport = {
      exportUserData: vi.fn().mockResolvedValue({
        metadata: { schemaVersion: "1.0", exportedAt: "2026-10-20" },
        user: { id: "user-1", email: "teste@exemplo.com" },
      }),
    };
    const mockDownload = {
      downloadJson: vi.fn().mockResolvedValue(true),
    };

    let result!: ReturnType<typeof useDeleteAccountViewModel>;
    function Probe() {
      result = useDeleteAccountViewModel(auth, stubHistory(), mockExport as any, mockDownload as any);
      return null;
    }
    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });

    let ok = false;
    await act(async () => {
      ok = await result[1].downloadUserData("user-1");
    });

    expect(ok).toBe(true);
    expect(result[0].exportSuccess).toBe(true);
    expect(result[0].exportError).toBeNull();
    expect(mockExport.exportUserData).toHaveBeenCalledWith("user-1");
    expect(mockDownload.downloadJson).toHaveBeenCalled();
  });

  it("rejeita download de dados se sessão for nula", async () => {
    const hook = await renderHook(stubAuth());

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].downloadUserData(null);
    });

    expect(ok).toBe(false);
    expect(hook.current[0].exportError).toBe("Você precisa estar conectado para baixar seus dados.");
  });
});
