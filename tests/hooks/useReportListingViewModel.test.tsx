import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DuplicateReportError, ValidationError } from "@/model/errors";
import type { IReportUseCases } from "@/usecase/iReportUseCases";
import { useReportListingViewModel } from "@/viewmodel/useReportListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function stubUseCases(overrides: Partial<IReportUseCases> = {}): IReportUseCases {
  return {
    submitReport: vi.fn(async (input, reporterId) => ({
      id: "report-1",
      listingId: input.listingId,
      reporterId: reporterId!,
      reason: input.reason,
      details: input.details,
      createdAt: new Date().toISOString(),
    })),
    ...overrides,
  };
}

async function renderHook(useCases: IReportUseCases) {
  let result!: ReturnType<typeof useReportListingViewModel>;
  function HookProbe() {
    result = useReportListingViewModel(useCases);
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

describe("useReportListingViewModel", () => {
  it("inicia com estado padrão limpo", async () => {
    const hook = await renderHook(stubUseCases());
    const [state] = hook.current;

    expect(state.reason).toBeNull();
    expect(state.details).toBe("");
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
  });

  it("atualiza motivo e detalhes", async () => {
    const hook = await renderHook(stubUseCases());

    await act(async () => {
      hook.current[1].setReason("fraud_or_scam");
      hook.current[1].setDetails("Livro suspeito");
    });

    const [state] = hook.current;
    expect(state.reason).toBe("fraud_or_scam");
    expect(state.details).toBe("Livro suspeito");
  });

  it("retorna falso e exibe erro se o usuário não estiver autenticado", async () => {
    const hook = await renderHook(stubUseCases());

    await act(async () => {
      hook.current[1].setReason("inappropriate_content");
    });

    let success = false;
    await act(async () => {
      success = await hook.current[1].submit("book-1", null);
    });

    const [state] = hook.current;
    expect(success).toBe(false);
    expect(state.error).toBe("Você precisa entrar na sua conta para denunciar um anúncio.");
    expect(state.success).toBe(false);
  });

  it("retorna falso e exibe erro se nenhum motivo for selecionado", async () => {
    const hook = await renderHook(stubUseCases());

    let success = false;
    await act(async () => {
      success = await hook.current[1].submit("book-1", "user-1");
    });

    const [state] = hook.current;
    expect(success).toBe(false);
    expect(state.error).toBe("Selecione um motivo para a denúncia.");
    expect(state.success).toBe(false);
  });

  it("submete com sucesso", async () => {
    const useCases = stubUseCases();
    const hook = await renderHook(useCases);

    await act(async () => {
      hook.current[1].setReason("piracy_or_copyright");
      hook.current[1].setDetails("Cópia pirata");
    });

    let success = false;
    await act(async () => {
      success = await hook.current[1].submit("book-99", "user-123");
    });

    const [state] = hook.current;
    expect(success).toBe(true);
    expect(state.success).toBe(true);
    expect(state.error).toBeNull();
    expect(useCases.submitReport).toHaveBeenCalledWith(
      {
        listingId: "book-99",
        reason: "piracy_or_copyright",
        details: "Cópia pirata",
      },
      "user-123",
    );
  });

  it("trata erro de domínio lançado pelo use case", async () => {
    const useCases = stubUseCases({
      submitReport: vi.fn(async () => {
        throw new ValidationError("Motivo inválido.");
      }),
    });
    const hook = await renderHook(useCases);

    await act(async () => {
      hook.current[1].setReason("other");
    });

    let success = false;
    await act(async () => {
      success = await hook.current[1].submit("book-1", "user-1");
    });

    const [state] = hook.current;
    expect(success).toBe(false);
    expect(state.error).toBe("Motivo inválido.");
    expect(state.success).toBe(false);
  });

  it("trata DuplicateReportError exibindo a mensagem amigável de duplicidade", async () => {
    const useCases = stubUseCases({
      submitReport: vi.fn(async () => {
        throw new DuplicateReportError("Você já denunciou este anúncio.");
      }),
    });
    const hook = await renderHook(useCases);

    await act(async () => {
      hook.current[1].setReason("other");
    });

    let success = false;
    await act(async () => {
      success = await hook.current[1].submit("book-1", "user-1");
    });

    const [state] = hook.current;
    expect(success).toBe(false);
    expect(state.error).toBe("Você já denunciou este anúncio.");
    expect(state.success).toBe(false);
  });
});
