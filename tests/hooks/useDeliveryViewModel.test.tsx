import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { Delivery } from "@/model/entities/delivery";
import type { IDeliveryUseCases } from "@/usecase/iDeliveryUseCases";
import {
  type DeliveryActions,
  type DeliveryState,
  type DeliveryStatus,
  useDeliveryStatus,
  useDeliveryViewModel,
} from "@/viewmodel/useDeliveryViewModel";

const mounted: ReactTestRenderer[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

type Hook = { current: [DeliveryState, DeliveryActions] };

async function renderHook(useCases: IDeliveryUseCases, sessionUserId: string, pollMs: number): Promise<{ result: Hook }> {
  const result = {} as Hook;
  function Probe() {
    result.current = useDeliveryViewModel("r1", sessionUserId, useCases, pollMs);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return { result };
}

/** Deixa as promessas e os temporizadores pendentes rodarem (até `ms`). */
async function waitFor(check: () => void, ms = 500): Promise<void> {
  const limit = Date.now() + ms;
  for (;;) {
    try {
      check();
      return;
    } catch (error) {
      if (Date.now() > limit) throw error;
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
  }
}

const done: Delivery = { requestId: "r1", completedBy: "leitora", completedAt: "2026-10-29T10:00:00.000Z" };

function fakeUseCases(overrides: Partial<IDeliveryUseCases> = {}): IDeliveryUseCases {
  return {
    getDelivery: vi.fn().mockResolvedValue(null),
    getRole: vi.fn().mockResolvedValue("giver"),
    generateCode: vi.fn().mockResolvedValue({ code: "K7M2QXWA", expiresAt: "2026-10-29T10:15:00.000Z" }),
    confirmDelivery: vi.fn().mockResolvedValue(done),
    ...overrides,
  };
}

describe("useDeliveryViewModel (Spec 095, CA6/CA7)", () => {
  it("anunciante: carrega o papel e já gera o código do QR", async () => {
    const useCases = fakeUseCases();
    const { result } = await renderHook(useCases, "dono", 0);
    await waitFor(() => expect(result.current[0].code?.code).toBe("K7M2QXWA"));
    expect(result.current[0]).toMatchObject({ loading: false, role: "giver", completed: null });
  });

  it("anunciante: gerar de novo troca o código", async () => {
    const generateCode = vi
      .fn()
      .mockResolvedValueOnce({ code: "AAAAAAAA", expiresAt: "2026-10-29T10:15:00.000Z" })
      .mockResolvedValueOnce({ code: "BBBBBBBB", expiresAt: "2026-10-29T10:30:00.000Z" });
    const { result } = await renderHook(fakeUseCases({ generateCode }), "dono", 0);
    await waitFor(() => expect(result.current[0].code?.code).toBe("AAAAAAAA"));
    await act(async () => { await result.current[1].generate(); });
    expect(result.current[0].code?.code).toBe("BBBBBBBB");
  });

  it("leitor: não gera código e confirma com o código lido", async () => {
    const useCases = fakeUseCases({ getRole: vi.fn().mockResolvedValue("receiver") });
    const { result } = await renderHook(useCases, "leitora", 0);
    await waitFor(() => expect(result.current[0].role).toBe("receiver"));
    expect(useCases.generateCode).not.toHaveBeenCalled();

    let ok = false;
    await act(async () => { ok = await result.current[1].confirm("K7M2QXWA"); });
    expect(ok).toBe(true);
    expect(result.current[0].completed).toEqual(done);
  });

  it("leitor: mostra o motivo quando o código é recusado", async () => {
    const confirmDelivery = vi.fn().mockRejectedValue(new ValidationError("Código incorreto."));
    const useCases = fakeUseCases({ getRole: vi.fn().mockResolvedValue("receiver"), confirmDelivery });
    const { result } = await renderHook(useCases, "leitora", 0);
    await waitFor(() => expect(result.current[0].role).toBe("receiver"));
    let ok = true;
    await act(async () => { ok = await result.current[1].confirm("K7M2QXWA"); });
    expect(ok).toBe(false);
    expect(result.current[0]).toMatchObject({ error: "Código incorreto.", completed: null, confirming: false });
  });

  it("entrega já concluída: não gera código", async () => {
    const useCases = fakeUseCases({ getDelivery: vi.fn().mockResolvedValue(done) });
    const { result } = await renderHook(useCases, "dono", 0);
    await waitFor(() => expect(result.current[0].completed).toEqual(done));
    expect(useCases.generateCode).not.toHaveBeenCalled();
  });

  it("anunciante: percebe quando a outra pessoa conclui (consulta periódica)", async () => {
    const getDelivery = vi.fn().mockResolvedValueOnce(null).mockResolvedValue(done);
    const { result } = await renderHook(fakeUseCases({ getDelivery }), "dono", 20);
    await waitFor(() => expect(result.current[0].completed).toEqual(done));
  });

  it("erro ao carregar vira mensagem", async () => {
    const getRole = vi.fn().mockRejectedValue(new ValidationError("Negociação não encontrada ou ainda não aceita."));
    const { result } = await renderHook(fakeUseCases({ getRole }), "dono", 0);
    await waitFor(() => expect(result.current[0].loadError).toBe("Negociação não encontrada ou ainda não aceita."));
  });

  it("falhas sem mensagem de domínio viram textos padrão", async () => {
    const generateCode = vi.fn().mockRejectedValue(new Error("rede"));
    const { result } = await renderHook(fakeUseCases({ generateCode }), "dono", 0);
    await waitFor(() => expect(result.current[0].error).toBe("Não foi possível gerar o código."));

    const getRole = vi.fn().mockRejectedValue(new Error("rede"));
    const falhaDeCarga = await renderHook(fakeUseCases({ getRole }), "dono", 0);
    await waitFor(() => expect(falhaDeCarga.result.current[0].loadError).toBe("Não foi possível carregar a entrega. Tente novamente."));

    const confirmDelivery = vi.fn().mockRejectedValue(new Error("rede"));
    const leitor = await renderHook(fakeUseCases({ getRole: vi.fn().mockResolvedValue("receiver"), confirmDelivery }), "leitora", 0);
    await waitFor(() => expect(leitor.result.current[0].role).toBe("receiver"));
    await act(async () => { await leitor.result.current[1].confirm("K7M2QXWA"); });
    expect(leitor.result.current[0].error).toBe("Não foi possível confirmar a entrega.");
  });

  it("a consulta periódica ignora falhas passageiras", async () => {
    const getDelivery = vi.fn().mockResolvedValueOnce(null).mockRejectedValue(new Error("rede"));
    const { result } = await renderHook(fakeUseCases({ getDelivery }), "dono", 15);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 60)); });
    expect(result.current[0]).toMatchObject({ completed: null, code: { code: "K7M2QXWA" } });
  });

  it("recarregar busca tudo de novo", async () => {
    const useCases = fakeUseCases({ getRole: vi.fn().mockResolvedValue("receiver") });
    const { result } = await renderHook(useCases, "leitora", 0);
    await waitFor(() => expect(result.current[0].role).toBe("receiver"));
    await act(async () => { await result.current[1].reload(); });
    expect(useCases.getRole).toHaveBeenCalledTimes(2);
  });
});

describe("useDeliveryStatus (cartão da negociação)", () => {
  async function renderStatus(useCases: IDeliveryUseCases, refreshKey = 0) {
    const result = {} as { current: DeliveryStatus };
    function Probe() {
      result.current = useDeliveryStatus("r1", "dono", refreshKey, useCases);
      return null;
    }
    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });
    return result;
  }

  it("informa o papel e se a entrega já foi concluída, sem gerar código", async () => {
    const useCases = fakeUseCases({ getDelivery: vi.fn().mockResolvedValue(done) });
    const result = await renderStatus(useCases);
    await waitFor(() => expect(result.current).toEqual({ loading: false, role: "giver", completed: done }));
    expect(useCases.generateCode).not.toHaveBeenCalled();
  });

  it("sem acesso à negociação, volta sem papel nem conclusão", async () => {
    const useCases = fakeUseCases({ getRole: vi.fn().mockRejectedValue(new ValidationError("x")) });
    const result = await renderStatus(useCases);
    await waitFor(() => expect(result.current).toEqual({ loading: false, role: null, completed: null }));
  });
});
