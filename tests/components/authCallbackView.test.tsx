
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import AuthCallback from "@/view/auth/authCallback";

jest.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: jest.fn(),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = jest.mocked(useAuthViewModel);

function mockAuth(state: AuthState, actions: Partial<AuthActions> = {}) {
  const fullActions: AuthActions = {
    signUp: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue(true),
    signInWithGoogle: jest.fn().mockResolvedValue(true),
    handleAuthCallback: jest.fn().mockResolvedValue(true),
    signOut: jest.fn().mockResolvedValue(true),
    requestPasswordReset: jest.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseAuthViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("tela de callback de autenticação (AuthCallback)", () => {
  it("chama handleAuthCallback e redireciona com sucesso", async () => {
    const handleAuthCallback = jest.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { handleAuthCallback });
    const onSuccess = jest.fn();

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

  it("conclui o login uma única vez mesmo com novas renderizações durante o processamento", async () => {
    let resolveCallback: (ok: boolean) => void = () => {};
    const handleAuthCallback = jest.fn(
      () => new Promise<boolean>((resolve) => { resolveCallback = resolve; }),
    );
    mockAuth({ user: null, loading: true, error: null }, { handleAuthCallback });
    const url = "https://ipebook.app/auth/callback#access_token=token&refresh_token=refresh";
    const firstOnSuccess = jest.fn();
    const secondOnSuccess = jest.fn();

    let view!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      view = await render(<AuthCallback url={url} onSuccess={firstOnSuccess} />);
    });
    // Nova renderização com ações e callback recriados, como ocorre ao mudar o estado.
    mockAuth({ user: null, loading: true, error: null }, { handleAuthCallback });
    await act(async () => {
      await view.rerender(<AuthCallback url={url} onSuccess={secondOnSuccess} />);
    });
    await act(async () => {
      resolveCallback(true);
    });

    expect(handleAuthCallback).toHaveBeenCalledTimes(1);
    expect(firstOnSuccess.mock.calls.length + secondOnSuccess.mock.calls.length).toBe(1);
  });

  it("exibe mensagem de erro quando o callback falha", async () => {
    const handleAuthCallback = jest.fn().mockResolvedValue(false);
    mockAuth({ user: null, loading: false, error: "Link inválido ou expirado." }, { handleAuthCallback });
    const onSuccess = jest.fn();
    const onBackToSignIn = jest.fn();

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

  it("mostra o motivo publicado pelo ViewModel depois de a tentativa falhar", async () => {
    const handleAuthCallback = jest.fn().mockResolvedValue(false);
    mockAuth({ user: null, loading: true, error: null }, { handleAuthCallback });
    const onSuccess = jest.fn();
    const url = "ipebook://auth/callback#error=access_denied";

    let view!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      view = await render(<AuthCallback url={url} onSuccess={onSuccess} />);
    });
    expect(screen.getByText("Não foi possível concluir o login.")).toBeDefined();

    // O ViewModel publica o motivo junto com o fim da tentativa; a tela acompanha o novo estado.
    mockAuth(
      { user: null, loading: false, error: "Não foi possível concluir o login com o provedor. Tente novamente." },
      { handleAuthCallback },
    );
    await act(async () => {
      await view.rerender(<AuthCallback url={url} onSuccess={onSuccess} />);
    });
    expect(
      screen.getByText("Não foi possível concluir o login com o provedor. Tente novamente."),
    ).toBeDefined();
    expect(screen.queryByText("Não foi possível concluir o login.")).toBeNull();
  });
});
