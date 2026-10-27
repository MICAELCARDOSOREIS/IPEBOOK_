import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { useProfileSafetyViewModel, type ProfileSafetyDeps } from "@/viewmodel/useProfileSafetyViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((t) => t.unmount()); });
});

const book = (id: string, ownerId: string, status: Book["status"] = "available"): Book => ({
  id, title: id, author: "A", ownerId, modality: "trade", status,
});

async function renderHook(deps: ProfileSafetyDeps) {
  let result!: ReturnType<typeof useProfileSafetyViewModel>;
  function Probe() {
    result = useProfileSafetyViewModel("me", "ana", deps);
    return null;
  }
  await act(async () => { mounted.push(create(createElement(Probe))); });
  return { get current() { return result; } };
}

describe("useProfileSafetyViewModel (Spec 091)", () => {
  it("lista só anúncios ativos da pessoa", async () => {
    const hook = await renderHook({
      blockUser: vi.fn(),
      listBooks: vi.fn().mockResolvedValue([book("a", "ana"), book("b", "caio"), book("c", "ana", "draft"), book("d", "ana", "reserved")]),
    });
    await act(async () => { await hook.current[1].loadListings(); });
    expect(hook.current[0].listings?.map((b) => b.id)).toEqual(["a", "d"]);
  });

  it("bloqueia a pessoa e marca como bloqueada", async () => {
    const blockUser = vi.fn().mockResolvedValue(undefined);
    const hook = await renderHook({ blockUser, listBooks: vi.fn() });
    let ok = false;
    await act(async () => { ok = await hook.current[1].block(); });
    expect(ok).toBe(true);
    expect(blockUser).toHaveBeenCalledWith("me", "ana");
    expect(hook.current[0].blocked).toBe(true);
  });

  it("ignora segundo toque enquanto bloqueia e mostra erro se falhar", async () => {
    let release!: () => void;
    const blockUser = vi.fn().mockReturnValue(new Promise<void>((resolve) => { release = resolve; }));
    const hook = await renderHook({ blockUser, listBooks: vi.fn() });
    await act(async () => { void hook.current[1].block(); void hook.current[1].block(); });
    expect(blockUser).toHaveBeenCalledTimes(1);
    await act(async () => { release(); });

    const failing = await renderHook({ blockUser: vi.fn().mockRejectedValue(new Error("rede")), listBooks: vi.fn() });
    await act(async () => { await failing.current[1].block(); });
    expect(failing.current[0].error).toBe("Não foi possível bloquear. Tente novamente.");
    expect(failing.current[0].blocked).toBe(false);
  });
});
