import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
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
    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "clearImmediate", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "queueMicrotask", "performance", "hrtime"],
    });
    jest.setSystemTime(new Date("2026-10-27T12:00:00"));
  });
  afterEach(() => {
    act(() => { mounted.splice(0).forEach((t) => t.unmount()); });
    jest.useRealTimers();
  });

  it("ignora o segundo toque dentro da janela e aceita depois dela", () => {
    const onPress = jest.fn();
    const press = mountHook(onPress, 600);
    press();
    press();
    expect(onPress).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date("2026-10-27T12:00:01"));
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("ignora rajada de múltiplos cliques rápidos (triplo toque)", () => {
    const onPress = jest.fn();
    const press = mountHook(onPress, 600);
    press(); // 1º toque (executa)
    jest.setSystemTime(new Date("2026-10-27T12:00:00.200"));
    press(); // 2º toque (bloqueia e renova)
    jest.setSystemTime(new Date("2026-10-27T12:00:00.400"));
    press(); // 3º toque (continua bloqueado)
    jest.setSystemTime(new Date("2026-10-27T12:00:00.550"));
    press(); // 4º toque
    expect(onPress).toHaveBeenCalledTimes(1);

    jest.setSystemTime(new Date("2026-10-27T12:00:02.000"));
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("sem janela (testes) deixa passar toques seguidos", () => {
    const onPress = jest.fn();
    const press = mountHook(onPress, 0);
    press();
    press();
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
