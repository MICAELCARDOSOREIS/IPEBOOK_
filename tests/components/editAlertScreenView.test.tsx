import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { searchAlertUseCases } from "@/di/container";
import EditAlertScreen from "@/view/search/editAlertScreen";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

const actions: AuthActions = {
  signUp: vi.fn().mockResolvedValue(false),
  signIn: vi.fn().mockResolvedValue(false),
  signOut: vi.fn().mockResolvedValue(undefined),
  requestPasswordReset: vi.fn().mockResolvedValue(false),
};

function authState(user: AuthState["user"]): [AuthState, AuthActions] {
  return [{ user, loading: false, error: null }, actions];
}

describe("EditAlertScreen", () => {
  it("repassa o id da pessoa autenticada para a tela de edição", async () => {
    mockedUseAuthViewModel.mockReturnValue(
      authState({ id: "ana", email: "ana@exemplo.com" } as AuthState["user"]),
    );
    const alert = await searchAlertUseCases.createAlert("ana", "Machado");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <EditAlertScreen alertId={alert.id} onBack={vi.fn()} onSaved={vi.fn()} />,
      );
    });

    await waitFor(() =>
      expect(screen.getByRole("header", { name: "Ajuste sua busca." })).toBeDefined(),
    );
  });

  it("repassa null quando não há sessão ativa", async () => {
    mockedUseAuthViewModel.mockReturnValue(authState(null));
    const alert = await searchAlertUseCases.createAlert("ana", "Machado");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <EditAlertScreen alertId={alert.id} onBack={vi.fn()} onSaved={vi.fn()} />,
      );
    });

    await waitFor(() => expect(screen.getByText("Alerta não encontrado")).toBeDefined());
  });
});
