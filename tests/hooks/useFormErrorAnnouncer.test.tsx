import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AccessibilityInfo } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function renderHook(error: string | null) {
  let ref!: ReturnType<typeof useFormErrorAnnouncer>;
  function HookProbe({ error }: { error: string | null }) {
    ref = useFormErrorAnnouncer(error);
    return null;
  }
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(createElement(HookProbe, { error }));
  });
  mounted.push(tree);
  return {
    get ref() {
      return ref;
    },
    rerender(nextError: string | null) {
      act(() => {
        tree.update(createElement(HookProbe, { error: nextError }));
      });
    },
  };
}

afterEach(() => {
  mounted.splice(0).forEach((tree) => tree.unmount());
});

describe("useFormErrorAnnouncer (Spec 042 / Issue #147)", () => {
  it("não anuncia nada quando não há erro", () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    renderHook(null);
    expect(announceSpy).not.toHaveBeenCalled();
    announceSpy.mockRestore();
  });

  it("anuncia a mensagem quando o erro aparece", () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    const hook = renderHook(null);
    hook.rerender("Selecione um motivo para a denúncia.");
    expect(announceSpy).toHaveBeenCalledWith("Selecione um motivo para a denúncia.");
    announceSpy.mockRestore();
  });

  it("não repete o anúncio quando a mesma mensagem persiste", () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    const hook = renderHook("Erro genérico.");
    hook.rerender("Erro genérico.");
    expect(announceSpy).toHaveBeenCalledTimes(1);
    announceSpy.mockRestore();
  });

  it("anuncia novamente quando a mensagem de erro muda", () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    const hook = renderHook("Primeiro erro.");
    hook.rerender("Segundo erro.");
    expect(announceSpy).toHaveBeenNthCalledWith(1, "Primeiro erro.");
    expect(announceSpy).toHaveBeenNthCalledWith(2, "Segundo erro.");
    announceSpy.mockRestore();
  });

  it("foca o elemento referenciado quando o erro aparece", () => {
    const hook = renderHook(null);
    const focus = vi.fn();
    (hook.ref as { current: unknown }).current = { focus };
    hook.rerender("Erro com foco.");
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
