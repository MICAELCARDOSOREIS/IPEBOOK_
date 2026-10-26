import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import AuthCallback from "@/view/auth/authCallback";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockAuth(state: AuthState, actions: Partial<AuthActions> = {}) {
  const fullActions: AuthActions = {
    signUp: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue(true),
    signInWithGoogle: vi.fn().mockResolvedValue(true),
    handleAuthCallback: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseAuthViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("tela de callback de autenticação (AuthCallback)", () => {
  it("chama handleAuthCallback e redireciona com sucesso", async () => {
    const handleAuthCallback = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { handleAuthCallback });
    const onSuccess = vi.fn();

    await act(async () => {
      render(
        <AuthCallback
          url="ipebook://auth/callback#access_token=token&refresh_token=refresh"
          onSuccess={onSuccess}
        />,
      );
    });

    expect(handleAuthCallback).toHaveBeenCalledWith(
      "ipebook://auth/callback#access_token=token&refresh_token=refresh",
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("exibe mensagem de erro quando o callback falha", async () => {
    const handleAuthCallback = vi.fn().mockResolvedValue(false);
    mockAuth({ user: null, loading: false, error: "Link inválido ou expirado." }, { handleAuthCallback });
    const onSuccess = vi.fn();
    const onBackToSignIn = vi.fn();

    await act(async () => {
      render(
        <AuthCallback
          url="ipebook://auth/callback#error=invalid"
          onSuccess={onSuccess}
          onBackToSignIn={onBackToSignIn}
        />,
      );
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText("Link inválido ou expirado.")).toBeDefined();

    const link = screen.getByText("Voltar para o login");
    fireEvent.press(link);
    expect(onBackToSignIn).toHaveBeenCalled();
  });
});
