import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { BlockedUsersActions, BlockedUsersState } from "@/viewmodel/useBlockedUsersViewModel";
import { BlockedUsers } from "@/view/profile/blockedUsers";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useBlockedUsersViewModel", () => ({ useBlockedUsersViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBlockedUsersViewModel } from "@/viewmodel/useBlockedUsersViewModel";

const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
const mockedUseBlockedUsersViewModel = vi.mocked(useBlockedUsersViewModel);

function mockAuth(user: AuthState["user"]) {
  mockedUseAuthViewModel.mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
  ]);
}

function mockBlocked(state: Partial<BlockedUsersState> = {}, actions: Partial<BlockedUsersActions> = {}) {
  const fullState: BlockedUsersState = {
    blockedUsers: [],
    loading: false,
    error: null,
    unblockingId: null,
    actionMessage: null,
    ...state,
  };
  const fullActions: BlockedUsersActions = {
    reload: vi.fn().mockResolvedValue(undefined),
    unblockUser: vi.fn().mockResolvedValue(true),
    clearActionMessage: vi.fn(),
    ...actions,
  };
  mockedUseBlockedUsersViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("tela de Pessoas bloqueadas (Figma 07.10-07.12 / Spec 056)", () => {
  it("exibe estado vazio quando não há pessoas bloqueadas", async () => {
    mockAuth({ id: "user-1", email: "user@exemplo.com" });
    mockBlocked({ blockedUsers: [] });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BlockedUsers onBack={() => {}} />);
    });

    expect(screen.getByText("Nenhuma pessoa bloqueada")).toBeDefined();
    expect(screen.getByText("Você não possui pessoas bloqueadas no momento.")).toBeDefined();
  });

  it("renderiza lista de bloqueados e abre diálogo de confirmação", async () => {
    mockAuth({ id: "user-1", email: "user@exemplo.com" });
    const unblockMock = vi.fn().mockResolvedValue(true);
    mockBlocked(
      {
        blockedUsers: [
          { userId: "target-1", name: "Marcos Silva", blockedAt: "2026-10-23T10:00:00Z" },
        ],
      },
      { unblockUser: unblockMock },
    );

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BlockedUsers onBack={() => {}} />);
    });

    expect(screen.getByText("Marcos Silva")).toBeDefined();
    expect(screen.getByText("Desbloquear")).toBeDefined();

    // Clica no botão de desbloquear
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Desbloquear Marcos Silva"));
    });

    // Diálogo aberto
    expect(screen.getByText("Desbloquear pessoa?")).toBeDefined();
    expect(
      screen.getByText(
        "Deseja desbloquear Marcos Silva? Essa pessoa voltará a ver seus livros e poderá enviar propostas.",
      ),
    ).toBeDefined();

    // Cancela
    await act(async () => {
      fireEvent.press(screen.getByText("Cancelar"));
    });

    expect(unblockMock).not.toHaveBeenCalled();

    // Reabre e confirma
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Desbloquear Marcos Silva"));
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Desbloquear"));
    });

    expect(unblockMock).toHaveBeenCalledWith("target-1");
  });

  it("aciona callback onBack na barra superior", async () => {
    mockAuth({ id: "user-1", email: "user@exemplo.com" });
    mockBlocked({ blockedUsers: [] });
    const onBack = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BlockedUsers onBack={onBack} />);
    });

    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
