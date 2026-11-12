
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
  it("mostra as opções de tema com 'Claro' selecionado por padrão e sem opção de tema escuro", async () => {
    const screen = await renderSelector();

    const group = screen.getByTestId("theme-toggle-radiogroup");
    expect(group.props.accessibilityRole).toBe("radiogroup");
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(false);
    expect(screen.getByLabelText("Tema Claro").props.accessibilityState.checked).toBe(true);
    expect(screen.queryByLabelText("Tema Escuro")).toBeNull();
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityHint).toBe("Acompanha a aparência do seu aparelho.");
    expect(screen.getByText("Usa fundos claros no aplicativo.")).toBeDefined();
    expect(screen.queryByText("Usa fundos escuros no aplicativo.")).toBeNull();
  });

  it("alterna para a opção 'Sistema' ao tocar nela", async () => {
    const screen = await renderSelector();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Tema Sistema"));
    });

    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Claro").props.accessibilityState.checked).toBe(false);
  });
});
