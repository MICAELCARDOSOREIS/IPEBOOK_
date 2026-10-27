import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import {
  findAcceptedRequestWith,
  NO_CONVERSATION_MESSAGE,
  useChatWithUser,
  type ChatWithUserDeps,
} from "@/viewmodel/useChatWithUser";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

const book = (ownerId: string): Book => ({ id: "b", title: "Livro", author: "A", ownerId, modality: "trade", status: "available" });
const entry = (id: string, requesterId: string, ownerId: string, status: "pending" | "accepted" | "rejected"): RequestWithListing => ({
  request: { id, listingId: "b", requesterId, status },
  listing: book(ownerId),
});

async function renderHook(deps: ChatWithUserDeps, onOpen: (id: string) => void) {
  let result!: ReturnType<typeof useChatWithUser>;
  function Probe() {
    result = useChatWithUser("me", "ana", onOpen, deps);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return { get current() { return result; } };
}

describe("findAcceptedRequestWith (Spec 091)", () => {
  it("acha a negociação aceita nos pedidos enviados e nos recebidos, ignorando pendentes e recusadas", () => {
    expect(findAcceptedRequestWith("ana", [entry("s1", "me", "ana", "accepted")], [])).toBe("s1");
    expect(findAcceptedRequestWith("ana", [], [entry("r1", "ana", "me", "accepted")])).toBe("r1");
    expect(findAcceptedRequestWith("ana", [entry("s2", "me", "ana", "pending")], [entry("r2", "ana", "me", "rejected")])).toBeNull();
    expect(findAcceptedRequestWith("ana", [entry("s3", "me", "caio", "accepted")], [])).toBeNull();
  });
});

describe("useChatWithUser (Spec 091)", () => {
  it("abre a conversa existente", async () => {
    const onOpen = vi.fn();
    const hook = await renderHook(
      { listSentRequests: vi.fn().mockResolvedValue([entry("s1", "me", "ana", "accepted")]), listReceivedRequests: vi.fn().mockResolvedValue([]) },
      onOpen,
    );
    await act(async () => { await hook.current.start(); });
    expect(onOpen).toHaveBeenCalledWith("s1");
    expect(hook.current.notice).toBeNull();
  });

  it("explica como começar quando não há negociação aceita", async () => {
    const onOpen = vi.fn();
    const hook = await renderHook({ listSentRequests: vi.fn().mockResolvedValue([]), listReceivedRequests: vi.fn().mockResolvedValue([]) }, onOpen);
    await act(async () => { await hook.current.start(); });
    expect(onOpen).not.toHaveBeenCalled();
    expect(hook.current.notice).toBe(NO_CONVERSATION_MESSAGE);
  });

  it("ignora o segundo toque enquanto a busca está em andamento (abria a tela duas vezes)", async () => {
    const onOpen = vi.fn();
    let release!: (value: RequestWithListing[]) => void;
    const pending = new Promise<RequestWithListing[]>((resolve) => { release = resolve; });
    const listSent = vi.fn().mockReturnValue(pending);
    const hook = await renderHook({ listSentRequests: listSent, listReceivedRequests: vi.fn().mockResolvedValue([]) }, onOpen);
    await act(async () => {
      void hook.current.start();
      void hook.current.start();
    });
    expect(listSent).toHaveBeenCalledTimes(1);
    await act(async () => { release([entry("s1", "me", "ana", "accepted")]); });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("mostra erro quando a busca falha", async () => {
    const hook = await renderHook({ listSentRequests: vi.fn().mockRejectedValue(new Error("rede")), listReceivedRequests: vi.fn().mockResolvedValue([]) }, vi.fn());
    await act(async () => { await hook.current.start(); });
    expect(hook.current.notice).toBe("Não foi possível abrir a conversa. Tente novamente.");
  });
});
