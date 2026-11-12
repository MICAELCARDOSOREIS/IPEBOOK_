import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGuardedPress } from "@/view/useGuardedPress";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function mountHook(onPress: () => void, windowMs: number) {
  let press!: () => void;
  function Probe() {
    press = useGuardedPress(onPress, windowMs);
    return null;
  }
  act(() => { mounted.push(create(createElement(Probe))); });
  return () => press();
}

describe("useGuardedPress (Spec 091)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T12:00:00"));
  });
  afterEach(() => {
    act(() => { mounted.splice(0).forEach((t) => t.unmount()); });
    vi.useRealTimers();
  });

  it("ignora o segundo toque dentro da janela e aceita depois dela", () => {
    const onPress = vi.fn();
    const press = mountHook(onPress, 600);
    press();
    press();
    expect(onPress).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-10-27T12:00:01"));
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("ignora rajada de múltiplos cliques rápidos (triplo toque)", () => {
    const onPress = vi.fn();
    const press = mountHook(onPress, 600);
    press(); // 1º toque (executa)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.200"));
    press(); // 2º toque (bloqueia e renova)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.400"));
    press(); // 3º toque (continua bloqueado)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.550"));
    press(); // 4º toque
    expect(onPress).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-10-27T12:00:02.000"));
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("sem janela (testes) deixa passar toques seguidos", () => {
    const onPress = vi.fn();
    const press = mountHook(onPress, 0);
    press();
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
