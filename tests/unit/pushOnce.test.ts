import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("expo-router", () => ({ router: { push: vi.fn() } }));

import { router } from "expo-router";
import { pushOnce } from "@/view/pushOnce";

describe("pushOnce (Spec 091)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T12:00:00"));
    vi.mocked(router.push).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignora o mesmo destino em duplo toque e aceita de novo depois da janela", () => {
    pushOnce("/conversa/aaa" as never);
    pushOnce("/conversa/aaa" as never);
    expect(router.push).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-10-27T12:00:01"));
    pushOnce("/conversa/aaa" as never);
    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it("não bloqueia destinos diferentes", () => {
    pushOnce("/livro/1" as never);
    pushOnce("/livro/2" as never);
    expect(router.push).toHaveBeenCalledTimes(2);
  });
});

describe("backOnce e replaceOnce (Spec 092)", () => {
  it("backOnce ignora o segundo toque e replaceOnce não confunde destinos", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T13:00:00"));
    (router as unknown as { back: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn> }).back = vi.fn();
    (router as unknown as { replace: ReturnType<typeof vi.fn> }).replace = vi.fn();
    const { backOnce, replaceOnce } = await import("@/view/pushOnce");
    backOnce();
    backOnce();
    expect(router.back).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-10-27T13:00:02"));
    replaceOnce("/entrar" as never);
    replaceOnce("/entrar" as never);
    replaceOnce({ pathname: "/alertas", params: { termo: "a" } } as never);
    expect(router.replace).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
