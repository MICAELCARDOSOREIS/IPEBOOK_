import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import Home from "@/view/home";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);
vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

describe("alternador de tema na Home (Spec 044 / Issue #144, ADR 0036)", () => {
  it("mostra as três opções de tema com 'Sistema' selecionado por padrão", async () => {
    const mockState: HomeState = { books: [], loading: true, error: null };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>,
      );
    });

    const group = screen.getByTestId("theme-toggle-radiogroup");
    expect(group.props.accessibilityRole).toBe("radiogroup");
    const systemOption = screen.getByLabelText("Tema Sistema");
    expect(systemOption.props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Claro").props.accessibilityState.checked).toBe(false);
    expect(screen.getByLabelText("Tema Escuro").props.accessibilityState.checked).toBe(false);
  });

  it("alterna para o tema escuro ao tocar na opção 'Escuro'", async () => {
    const mockState: HomeState = { books: [], loading: true, error: null };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Tema Escuro"));
    });

    expect(screen.getByLabelText("Tema Escuro").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(false);
  });
});
