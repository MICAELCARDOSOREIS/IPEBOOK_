import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

async function renderSelector() {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(
      <ThemeProvider>
        <ThemePreferenceSelector />
      </ThemeProvider>,
    );
  });
  return screen;
}

describe("alternador de tema (Spec 054 / Issue #144, ADR 0036)", () => {
  it("mostra as três opções de tema com 'Sistema' selecionado por padrão", async () => {
    const screen = await renderSelector();

    const group = screen.getByTestId("theme-toggle-radiogroup");
    expect(group.props.accessibilityRole).toBe("radiogroup");
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Claro").props.accessibilityState.checked).toBe(false);
    expect(screen.getByLabelText("Tema Escuro").props.accessibilityState.checked).toBe(false);
  });

  it("alterna para o tema escuro ao tocar na opção 'Escuro'", async () => {
    const screen = await renderSelector();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Tema Escuro"));
    });

    expect(screen.getByLabelText("Tema Escuro").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(false);
  });
});
