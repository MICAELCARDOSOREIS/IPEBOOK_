import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { ThemeToggleButton } from "@/view/components/ThemeToggleButton";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

describe("botão de tema do site (Spec 108)", () => {
  it("alterna entre claro e escuro a cada toque", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ThemeToggleButton />
        </ThemeProvider>,
      );
    });
    await act(async () => { fireEvent.press(screen.getByLabelText("Usar tema escuro")); });
    expect(screen.getByLabelText("Usar tema claro")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Usar tema claro")); });
    expect(screen.getByLabelText("Usar tema escuro")).toBeDefined();
  });
});
