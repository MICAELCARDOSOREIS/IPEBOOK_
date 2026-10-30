import React from "react";
import { AccessibilityInfo, Animated, StyleSheet } from "react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook } from "@testing-library/react-native";
import { tokens } from "@/view/tokens";
import { useExpressivePress } from "@/view/useExpressivePress";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";

describe("Material 3 Expressive — Tokens, Física de Mola e Shape Morphing (Spec 109, ADR 0084)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("expõe tokens de física de mola (spring) com tension e friction positivos", () => {
    expect(tokens.spring).toBeDefined();
    for (const key of ["spatialFast", "spatialStandard", "spatialSlow", "effectsFast"] as const) {
      expect(tokens.spring[key].tension).toBeGreaterThan(0);
      expect(tokens.spring[key].friction).toBeGreaterThan(0);
    }
    expect(tokens.spring.spatialFast.tension).toBeGreaterThan(tokens.spring.spatialSlow.tension);
  });

  it("expõe tokens de metamorfose de forma (shapeMorph) para botões, chips e cartões", () => {
    expect(tokens.shapeMorph).toEqual({
      buttonRest: 9999,
      buttonPressed: 16,
      chipUnselected: 8,
      chipSelected: 16,
      cardRest: 16,
      cardPressed: 20,
    });
  });

  it("useExpressivePress alterna isPressed e dispara Animated.spring quando reduzir movimento está desativado", async () => {
    vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    const springSpy = vi.spyOn(Animated, "spring");

    const { result } = await renderHook(() => useExpressivePress({ pressedScale: 0.96 }));
    expect(result.current.isPressed).toBe(false);

    await act(async () => {
      result.current.onPressIn();
    });
    expect(result.current.isPressed).toBe(true);
    expect(springSpy).toHaveBeenCalledWith(
      result.current.scale,
      expect.objectContaining({
        toValue: 0.96,
        tension: tokens.spring.spatialFast.tension,
        friction: tokens.spring.spatialFast.friction,
      }),
    );

    await act(async () => {
      result.current.onPressOut();
    });
    expect(result.current.isPressed).toBe(false);
    expect(springSpy).toHaveBeenLastCalledWith(
      result.current.scale,
      expect.objectContaining({
        toValue: 1,
      }),
    );
  });

  it("useExpressivePress ignora onPressIn quando disabled=true", async () => {
    const { result } = await renderHook(() => useExpressivePress({ disabled: true }));
    await act(async () => {
      result.current.onPressIn();
    });
    expect(result.current.isPressed).toBe(false);
  });

  it("useExpressivePress respeita isReduceMotionEnabled aplicando setValue direto sem Animated.spring", async () => {
    vi.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    const springSpy = vi.spyOn(Animated, "spring");

    const { result } = await renderHook(() => useExpressivePress({ pressedScale: 0.95 }));
    await act(async () => {
      await Promise.resolve();
    });

    const setValueSpy = vi.spyOn(result.current.scale, "setValue");
    await act(async () => {
      result.current.onPressIn();
    });

    expect(result.current.isPressed).toBe(true);
    expect(setValueSpy).toHaveBeenCalledWith(0.95);
    expect(springSpy).not.toHaveBeenCalled();
  });

  it("Chip alterna borderRadius entre chipUnselected (8) e chipSelected (16)", async () => {
    const { getByRole, rerender } = await render(
      React.createElement(Chip, { label: "Doação", selected: false, onPress: () => {} }),
    );
    const chipUnselectedStyle = StyleSheet.flatten(getByRole("checkbox").props.style);
    expect(chipUnselectedStyle.borderRadius).toBe(tokens.shapeMorph.chipUnselected);

    await rerender(React.createElement(Chip, { label: "Doação", selected: true, onPress: () => {} }));
    const chipSelectedStyle = StyleSheet.flatten(getByRole("checkbox").props.style);
    expect(chipSelectedStyle.borderRadius).toBe(tokens.shapeMorph.chipSelected);
  });

  it("FilledButton faz metamorfose de buttonRest (9999) para buttonPressed (16) ao pressionar", async () => {
    const { getByRole } = await render(
      React.createElement(FilledButton, { label: "Confirmar", onPress: () => {} }),
    );
    const button = getByRole("button");
    expect(StyleSheet.flatten(button.props.style).borderRadius).toBe(tokens.shapeMorph.buttonRest);

    await act(async () => {
      fireEvent(button, "pressIn");
    });
    expect(StyleSheet.flatten(getByRole("button").props.style).borderRadius).toBe(
      tokens.shapeMorph.buttonPressed,
    );

    await act(async () => {
      fireEvent(button, "pressOut");
    });
    expect(StyleSheet.flatten(getByRole("button").props.style).borderRadius).toBe(
      tokens.shapeMorph.buttonRest,
    );
  });

  it("OutlinedButton faz metamorfose de buttonRest (9999) para buttonPressed (16) ao pressionar", async () => {
    const { getByRole } = await render(
      React.createElement(OutlinedButton, { label: "Cancelar", onPress: () => {} }),
    );
    const outlined = getByRole("button");
    expect(StyleSheet.flatten(outlined.props.style).borderRadius).toBe(tokens.shapeMorph.buttonRest);

    await act(async () => {
      fireEvent(outlined, "pressIn");
    });
    expect(StyleSheet.flatten(getByRole("button").props.style).borderRadius).toBe(
      tokens.shapeMorph.buttonPressed,
    );

    await act(async () => {
      fireEvent(outlined, "pressOut");
    });
    expect(StyleSheet.flatten(getByRole("button").props.style).borderRadius).toBe(
      tokens.shapeMorph.buttonRest,
    );
  });

  it("TextButton faz metamorfose de buttonRest (9999) para buttonPressed (16) ao pressionar", async () => {
    const { getByRole } = await render(
      React.createElement(TextButton, { label: "Voltar ao início", onPress: () => {} }),
    );
    const textBtn = getByRole("button");
    expect(StyleSheet.flatten(textBtn.props.style).borderRadius).toBe(tokens.shapeMorph.buttonRest);

    await act(async () => {
      fireEvent(textBtn, "pressIn");
    });
    expect(StyleSheet.flatten(getByRole("button").props.style).borderRadius).toBe(
      tokens.shapeMorph.buttonPressed,
    );
  });
});
