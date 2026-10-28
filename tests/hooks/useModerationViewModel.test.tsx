import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryModerationDataSource } from "@/infra/datasources/memoryModerationDataSource";
import type { ModerationItem } from "@/model/entities/moderation";
import { ModerationUseCases } from "@/usecase/moderationUseCases";
import { useIsModerator, useModerationViewModel } from "@/viewmodel/useModerationViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

async function probe<T>(hook: () => T) {
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

const item: ModerationItem = {
  kind: "listing", targetId: "b1", label: "Dom Casmurro", ownerId: "ana",
  reasons: ["fraud_or_scam"], details: [], reportCount: 3, firstReportedAt: "2026-10-28T10:00:00Z",
};

describe("useModerationViewModel (Spec 102)", () => {
  it("carrega a fila e tira o item depois da decisão", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([item], true));
    const hook = await probe(() => useModerationViewModel("mod", useCases));
    expect(hook.current[0].items).toHaveLength(1);
    let ok = false;
    await act(async () => { ok = await hook.current[1].decide(item, "dismiss"); });
    expect(ok).toBe(true);
    expect(hook.current[0].items).toHaveLength(0);
    expect(hook.current[0].actionMessage).toBe("Denúncias arquivadas.");
  });

  it("mostra erro de acesso para quem não é moderador", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([item], false));
    const hook = await probe(() => useModerationViewModel("bia", useCases));
    expect(hook.current[0].error).toBe("Acesso restrito à moderação.");
  });

  it("useIsModerator reflete a conta", async () => {
    const yes = await probe(() => useIsModerator("mod", new ModerationUseCases(new MemoryModerationDataSource([], true))));
    const no = await probe(() => useIsModerator(null, new ModerationUseCases(new MemoryModerationDataSource([], true))));
    expect(yes.current).toBe(true);
    expect(no.current).toBe(false);
  });

  it("decisão recusada mostra a mensagem e devolve falso", async () => {
    const useCases = new ModerationUseCases(new MemoryModerationDataSource([{ ...item, kind: "user" }], true));
    const hook = await probe(() => useModerationViewModel("mod", useCases));
    let ok = true;
    await act(async () => { ok = await hook.current[1].decide(hook.current[0].items[0], "remove_listing"); });
    expect(ok).toBe(false);
    expect(hook.current[0].actionMessage).toBe("Só é possível remover um anúncio denunciado.");
    await act(async () => { hook.current[1].clearActionMessage(); });
    expect(hook.current[0].actionMessage).toBeNull();
    expect(hook.current[0].decidingId).toBeNull();
  });
});
