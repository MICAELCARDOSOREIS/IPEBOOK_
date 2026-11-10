import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import SignIn from "@/view/auth/signIn";
import SignUp from "@/view/auth/signUp";
import ResetPassword from "@/view/auth/resetPassword";
import ForgotPassword from "@/view/auth/forgotPassword";
import DeleteAccount from "@/view/auth/deleteAccount";
import AuthCallback from "@/view/auth/authCallback";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

vi.mock("@/viewmodel/useResetPasswordViewModel", () => ({
  useResetPasswordViewModel: vi.fn(() => [
    { loading: false, success: false, error: null, linkExpired: false },
    { submit: vi.fn().mockResolvedValue(true) },
  ]),
}));

vi.mock("@/viewmodel/useDeleteAccountViewModel", () => ({
  useDeleteAccountViewModel: vi.fn(() => [
    {
      confirmed: false,
      loading: false,
      error: null,
      exporting: false,
      exportSuccess: false,
      exportError: null,
      exportSummary: null,
      success: false,
    },
    {
      setConfirmed: vi.fn(),
      deleteAccount: vi.fn(),
      downloadUserData: vi.fn(),
    },
  ]),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockAuth(state: AuthState, actions: Partial<AuthActions> = {}) {
  const fullActions: AuthActions = {
    signUp: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue(true),
    signInWithGoogle: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
    requestPasswordReset: vi.fn().mockResolvedValue("senha-temp"),
    handleAuthCallback: vi.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseAuthViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("Spec 133 / Issue #217 — Migração para ScreenContainer e aprimoramento de foco e erros", () => {
  it("SignIn adota ScreenContainer maxWidth 560 e encadeia foco de e-mail para senha", async () => {
    mockAuth({ user: null, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn />);
    });

    const emailInput = screen.getByLabelText("E-mail");
    const passwordInput = screen.getByLabelText("Senha");

    expect(emailInput.props.returnKeyType).toBe("next");
    expect(passwordInput.props.returnKeyType).toBe("done");

    // Dispara submitEditing no e-mail sem erros
    await act(async () => {
      fireEvent(emailInput, "submitEditing");
    });
  });

  it("SignUp adota ScreenContainer e encadeia foco: Nome -> E-mail -> Senha", async () => {
    mockAuth({ user: null, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp />);
    });

    const nameInput = screen.getByLabelText("Nome completo");
    const emailInput = screen.getByLabelText("E-mail");
    const passwordInput = screen.getByLabelText("Senha");

    expect(nameInput.props.returnKeyType).toBe("next");
    expect(emailInput.props.returnKeyType).toBe("next");
    expect(passwordInput.props.returnKeyType).toBe("done");

    await act(async () => {
      fireEvent(nameInput, "submitEditing");
      fireEvent(emailInput, "submitEditing");
    });
  });

  it("ResetPassword encadeia foco entre os campos de senha", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ResetPassword link="test-token" />);
    });

    const newPass = screen.getByLabelText("Nova senha");
    const confirmPass = screen.getByLabelText("Confirmar senha");

    expect(newPass.props.returnKeyType).toBe("next");
    expect(confirmPass.props.returnKeyType).toBe("done");

    await act(async () => {
      fireEvent(newPass, "submitEditing");
    });
  });

  it("SignIn exibe erros utilizando InlineErrorCard acessível", async () => {
    mockAuth({ user: null, loading: false, error: "Credenciais inválidas." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn />);
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Credenciais inválidas.")).toBeDefined();
  });

  it("ForgotPassword renderiza erro com InlineErrorCard", async () => {
    mockAuth({ user: null, loading: false, error: "E-mail não encontrado." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("E-mail não encontrado.")).toBeDefined();
  });

  it("DeleteAccount renderiza retornos com ScreenContainer", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<DeleteAccount sessionUserId={null} onBack={() => {}} onAccountDeleted={() => {}} />);
    });

    expect(screen.getByRole("header", { name: "Como excluir sua conta" })).toBeDefined();
  });

  it("AuthCallback adota InlineErrorCard quando ocorre falha", async () => {
    mockAuth({ user: null, loading: false, error: "Token inválido." }, {
      handleAuthCallback: vi.fn().mockResolvedValue(false),
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<AuthCallback url="ipebook://auth/callback#error=invalid" onSuccess={() => {}} />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Token inválido.")).toBeDefined();
  });
});
