import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Settings } from "@/view/profile/settings";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

describe("Configurações — tela dedicada (Spec 073, ADR 0036)", () => {
  afterEach(() => {
    cleanup();
  });

  async function renderSettings(onBack = vi.fn()) {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <Settings onBack={onBack} />
        </ThemeProvider>,
      );
    });
    return { screen, onBack };
  }

  it("renderiza o título 'Configurações' na TopAppBar e aciona onBack ao tocar no botão voltar", async () => {
    const { screen, onBack } = await renderSettings();

    // Título na barra superior
    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).toContain("Configurações");

    // Botão voltar aciona onBack
    const backButton = screen.getByLabelText("Voltar");
    expect(backButton).toBeDefined();

    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderiza a seção 'Aparência' com as opções de tema em radiogroup acessível", async () => {
    const { screen } = await renderSettings();

    // Cabeçalho e descrição da seção
    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).toContain("Aparência");
    expect(screen.getByText("Escolha como o aplicativo aparece para você.")).toBeDefined();

    // Radiogroup acessível
    const group = screen.getByTestId("theme-toggle-radiogroup");
    expect(group).toBeDefined();
    expect(group.props.accessibilityRole).toBe("radiogroup");

    // Opções Sistema, Claro e Escuro com role radio
    const sistemaOption = screen.getByLabelText("Tema Sistema");
    const claroOption = screen.getByLabelText("Tema Claro");
    const escuroOption = screen.getByLabelText("Tema Escuro");

    expect(sistemaOption).toBeDefined();
    expect(claroOption).toBeDefined();
    expect(escuroOption).toBeDefined();

    expect(sistemaOption.props.accessibilityRole).toBe("radio");
    expect(claroOption.props.accessibilityRole).toBe("radio");
    expect(escuroOption.props.accessibilityRole).toBe("radio");

    // Sistema selecionado por padrão
    expect(sistemaOption.props.accessibilityState.checked).toBe(true);
    expect(claroOption.props.accessibilityState.checked).toBe(false);
    expect(escuroOption.props.accessibilityState.checked).toBe(false);
  });

  it("alterna a opção de tema ao selecionar Claro ou Escuro", async () => {
    const { screen } = await renderSettings();

    const escuroOption = screen.getByLabelText("Tema Escuro");
    await act(async () => {
      fireEvent.press(escuroOption);
    });

    expect(escuroOption.props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(false);
  });
});
