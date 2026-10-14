import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import type { Book } from "@/model/entities/book";
import { DataSourceError } from "@/model/errors";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length) mounted.pop()?.unmount();
  });
});

async function renderHook<T>(hook: () => T) {
  let result!: T;
  function Probe() {
    result = hook();
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return { get current() { return result; } };
}

const listing: Book = {
  id: "listing-1",
  title: "Quarto de Despejo",
  author: "Carolina Maria de Jesus",
  ownerId: "owner",
  modality: "donation",
  status: "available",
};

function setup() {
  const books = new MemoryBookDataSource([listing]);
  const requests = new MemoryBookRequestDataSource();
  return { books, requests, useCases: new BookRequestUseCases(books, requests) };
}

describe("useRequestNegotiationViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("marca o anúncio como solicitado em caso de sucesso", async () => {
    const { useCases } = setup();
    const hook = await renderHook(() => useRequestNegotiationViewModel(useCases));
    let ok = false;
    await act(async () => { ok = await hook.current[1].request("listing-1", "alice"); });
    expect(ok).toBe(true);
    expect(hook.current[0]).toMatchObject({ pendingListingId: null, requestedListingIds: ["listing-1"], error: null });
  });

  it("mostra a mensagem de domínio associada ao anúncio que falhou", async () => {
    const { useCases } = setup();
    const hook = await renderHook(() => useRequestNegotiationViewModel(useCases));
    await act(async () => { await hook.current[1].request("listing-1", "owner"); });
    expect(hook.current[0].error).toMatch(/próprio anúncio/);
    expect(hook.current[0].errorListingId).toBe("listing-1");
    expect(hook.current[0].requestedListingIds).toEqual([]);
  });

  it("sanitiza erro técnico inesperado", async () => {
    const failing = { requestNegotiation: async () => { throw new Error("stack interna"); } } as unknown as IBookRequestUseCases;
    const hook = await renderHook(() => useRequestNegotiationViewModel(failing));
    await act(async () => { await hook.current[1].request("listing-1", "alice"); });
    expect(hook.current[0].error).toBe("Não foi possível solicitar a negociação. Tente novamente.");
  });
});

describe("useReceivedRequestsViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("carrega pedidos recebidos e, ao aceitar, recarrega com concorrentes recusados", async () => {
    const { useCases, books } = setup();
    const a = await useCases.requestNegotiation("listing-1", "alice");
    const b = await useCases.requestNegotiation("listing-1", "bob");
    const hook = await renderHook(() => useReceivedRequestsViewModel("owner", useCases));
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].items).toHaveLength(2);

    await act(async () => { await hook.current[1].accept(a.id); });
    const status = Object.fromEntries(hook.current[0].items.map((i) => [i.request.id, i.request.status]));
    expect(status).toEqual({ [a.id]: "accepted", [b.id]: "rejected" });
    expect(hook.current[0].items[0].listing.status).toBe("reserved");
    expect((await books.findById("listing-1"))?.status).toBe("reserved");
  });

  it("recusar atualiza o pedido; responder de novo mostra erro no pedido", async () => {
    const { useCases } = setup();
    const a = await useCases.requestNegotiation("listing-1", "alice");
    const hook = await renderHook(() => useReceivedRequestsViewModel("owner", useCases));
    await act(async () => { await hook.current[1].reject(a.id); });
    expect(hook.current[0].items[0].request.status).toBe("rejected");

    let ok = true;
    await act(async () => { ok = await hook.current[1].accept(a.id); });
    expect(ok).toBe(false);
    expect(hook.current[0].respondErrorId).toBe(a.id);
    expect(hook.current[0].respondError).toMatch(/já foi respondido/);
    expect(hook.current[0].respondingId).toBeNull();
  });

  it("expõe erro de carregamento e permite recarregar", async () => {
    let fail = true;
    const { useCases } = setup();
    const flaky: IBookRequestUseCases = {
      ...useCases,
      requestNegotiation: useCases.requestNegotiation.bind(useCases),
      listSentRequests: useCases.listSentRequests.bind(useCases),
      respondToRequest: useCases.respondToRequest.bind(useCases),
      listReceivedRequests: async (id) => {
        if (fail) throw new DataSourceError("Pedidos indisponíveis.");
        return useCases.listReceivedRequests(id);
      },
    };
    const hook = await renderHook(() => useReceivedRequestsViewModel("owner", flaky));
    expect(hook.current[0].error).toBe("Pedidos indisponíveis.");
    fail = false;
    await act(async () => { await hook.current[1].reload(); });
    expect(hook.current[0]).toMatchObject({ error: null, loading: false, items: [] });
  });
});

describe("useSentRequestsViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("lista os pedidos enviados com status atual", async () => {
    const { useCases } = setup();
    const a = await useCases.requestNegotiation("listing-1", "alice");
    await useCases.respondToRequest(a.id, "accept", "owner");
    const hook = await renderHook(() => useSentRequestsViewModel("alice", useCases));
    expect(hook.current[0].items.map((i) => i.request.status)).toEqual(["accepted"]);
  });

  it("sanitiza erro técnico ao carregar", async () => {
    const failing = { listSentRequests: async () => { throw new Error("boom"); } } as unknown as IBookRequestUseCases;
    const hook = await renderHook(() => useSentRequestsViewModel("alice", failing));
    expect(hook.current[0].error).toBe("Não foi possível carregar os pedidos. Tente novamente.");
  });
});
