import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import { useNavigationBadgesViewModel, type NavigationBadgesDeps } from "@/viewmodel/useNavigationBadgesViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((t) => t.unmount()); });
});

const book: Book = { id: "b", title: "L", author: "A", ownerId: "me", modality: "trade", status: "available" };
const entry = (id: string, status: "pending" | "accepted" | "rejected"): RequestWithListing => ({
  request: { id, listingId: "b", requesterId: "ana", status },
  listing: book,
});

async function renderHook(sessionUserId: string | null, deps: NavigationBadgesDeps) {
  let result!: ReturnType<typeof useNavigationBadgesViewModel>;
  function Probe() {
    result = useNavigationBadgesViewModel(sessionUserId, "/", deps);
    return null;
  }
  await act(async () => { mounted.push(create(createElement(Probe))); });
  return { get current() { return result; } };
}

describe("useNavigationBadgesViewModel (Spec 091)", () => {
  it("conta só propostas recebidas pendentes", async () => {
    const hook = await renderHook("me", {
      listReceivedRequests: vi.fn().mockResolvedValue([entry("1", "pending"), entry("2", "accepted"), entry("3", "pending"), entry("4", "rejected")]),
    });
    expect(hook.current.conversations).toBe(2);
  });

  it("não mostra selo sem sessão e mantém zero se a consulta falhar", async () => {
    const list = vi.fn().mockRejectedValue(new Error("rede"));
    expect((await renderHook(null, { listReceivedRequests: list })).current.conversations).toBe(0);
    expect(list).not.toHaveBeenCalled();
    expect((await renderHook("me", { listReceivedRequests: list })).current.conversations).toBe(0);
  });

  it("recarrega quando chega aviso em tempo real e cancela ao desmontar", async () => {
    let push: (() => void) | undefined;
    const off = vi.fn();
    const list = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([entry("1", "pending")]);
    const hook = await renderHook("me", {
      listReceivedRequests: list,
      subscribe: (_id, onChange) => { push = onChange; return off; },
    });
    expect(hook.current.conversations).toBe(0);
    await act(async () => { push?.(); });
    expect(hook.current.conversations).toBe(1);
    await act(async () => { mounted.splice(0).forEach((t) => t.unmount()); });
    expect(off).toHaveBeenCalledTimes(1);
  });
});
