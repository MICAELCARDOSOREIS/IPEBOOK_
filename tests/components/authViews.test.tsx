import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import ForgotPassword from "@/view/auth/forgotPassword";
import SignIn from "@/view/auth/signIn";
import SignUp from "@/view/auth/signUp";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockAuth(state: AuthState, actions: Partial<AuthActions> = {}) {
  const fullActions: AuthActions = {
    signUp: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(undefined),
    requestPasswordReset: vi.fn().mockResolvedValue("senha-temp"),
    ...actions,
  };
  mockedUseAuthViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("tela de entrar (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("renderiza cabeçalho e campos de e-mail e senha", async () => {
    mockAuth({ user: null, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn />);
    });

    expect(screen.getByRole("header").props.children).toBe("IpêBook");
    expect(screen.getAllByText("Entrar").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Senha")).toBeDefined();
  });

  it("exibe indicador de carregamento enquanto autentica", async () => {
    mockAuth({ user: null, loading: true, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn />);
    });

    expect(screen.getByLabelText("Entrando")).toBeDefined();
  });

  it("exibe mensagem de erro de credenciais inválidas", async () => {
    mockAuth({ user: null, loading: false, error: "Credenciais inválidas." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Credenciais inválidas.")).toBeDefined();
  });

  it("chama onAuthenticated após login bem-sucedido", async () => {
    const signIn = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { signIn });
    const onAuthenticated = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn onAuthenticated={onAuthenticated} />);
    });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("E-mail"), "pessoa@exemplo.com");
      fireEvent.changeText(screen.getByLabelText("Senha"), "12345678");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    });

    expect(signIn).toHaveBeenCalledWith("pessoa@exemplo.com", "12345678");
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("não chama onAuthenticated quando o login falha", async () => {
    const signIn = vi.fn().mockResolvedValue(false);
    mockAuth({ user: null, loading: false, error: null }, { signIn });
    const onAuthenticated = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn onAuthenticated={onAuthenticated} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    });

    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it("aciona a navegação para criar conta", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onNavigateToSignUp = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn onNavigateToSignUp={onNavigateToSignUp} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Ainda não tem conta? Criar conta"));
    });

    expect(onNavigateToSignUp).toHaveBeenCalledTimes(1);
  });

  it("aciona a navegação para esqueceu a senha", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onNavigateToForgotPassword = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignIn onNavigateToForgotPassword={onNavigateToForgotPassword} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Esqueceu a senha?"));
    });

    expect(onNavigateToForgotPassword).toHaveBeenCalledTimes(1);
  });
});

describe("tela de criar conta (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("renderiza cabeçalho e campos de e-mail e senha", async () => {
    mockAuth({ user: null, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp />);
    });

    expect(screen.getByRole("header").props.children).toBe("IpêBook");
    expect(screen.getAllByText("Criar conta").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Senha")).toBeDefined();
  });

  it("exibe mensagem de e-mail já cadastrado", async () => {
    mockAuth({ user: null, loading: false, error: "Este e-mail já está em uso." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp />);
    });

    expect(screen.getByText("Este e-mail já está em uso.")).toBeDefined();
  });

  it("chama onAuthenticated após criar conta com sucesso", async () => {
    const signUp = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { signUp });
    const onAuthenticated = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp onAuthenticated={onAuthenticated} />);
    });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("E-mail"), "nova@exemplo.com");
      fireEvent.changeText(screen.getByLabelText("Senha"), "12345678");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Criar conta" }));
    });

    expect(signUp).toHaveBeenCalledWith("nova@exemplo.com", "12345678");
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("aciona a navegação para entrar", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onNavigateToSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp onNavigateToSignIn={onNavigateToSignIn} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Já tem conta? Entrar"));
    });

    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });
});

describe("tela de esqueceu a senha (ISO/IEC 25010 - Usabilidade e Acessibilidade, US1)", () => {
  it("renderiza cabeçalho e campo de e-mail", async () => {
    mockAuth({ user: null, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword />);
    });

    expect(screen.getByRole("header").props.children).toBe("IpêBook");
    expect(screen.getByText("Esqueceu a senha?")).toBeDefined();
    expect(screen.getByLabelText("E-mail")).toBeDefined();
  });

  it("confirma a solicitação sem exibir senha", async () => {
    const requestPasswordReset = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { requestPasswordReset });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword />);
    });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("E-mail"), "pessoa@exemplo.com");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Recuperar senha" }));
    });

    expect(requestPasswordReset).toHaveBeenCalledWith("pessoa@exemplo.com");
    expect(screen.getByText("Se houver uma conta com este e-mail, enviaremos um link de recuperação.")).toBeDefined();
    expect(screen.queryByLabelText("E-mail")).toBeNull();
  });

  it("exibe erro quando o envio não está disponível", async () => {
    mockAuth(
      { user: null, loading: false, error: "Recuperação por e-mail indisponível no modo local." },
      { requestPasswordReset: vi.fn().mockResolvedValue(false) },
    );

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Recuperação por e-mail indisponível no modo local.")).toBeDefined();
  });

  it("aciona a navegação de volta ao login", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onNavigateToSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword onNavigateToSignIn={onNavigateToSignIn} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Voltar para o login"));
    });

    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });

  it("aciona a navegação de voltar quando onBack é fornecido em SignIn, SignUp e ForgotPassword", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onBackSignIn = vi.fn();
    const onBackSignUp = vi.fn();
    const onBackForgot = vi.fn();

    let screenSignIn!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screenSignIn = await render(<SignIn onBack={onBackSignIn} />);
    });
    await act(async () => {
      fireEvent.press(screenSignIn.getByLabelText("Voltar"));
    });
    expect(onBackSignIn).toHaveBeenCalledTimes(1);

    let screenSignUp!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screenSignUp = await render(<SignUp onBack={onBackSignUp} />);
    });
    await act(async () => {
      fireEvent.press(screenSignUp.getByLabelText("Voltar"));
    });
    expect(onBackSignUp).toHaveBeenCalledTimes(1);

    let screenForgot!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screenForgot = await render(<ForgotPassword onBack={onBackForgot} />);
    });
    await act(async () => {
      fireEvent.press(screenForgot.getByLabelText("Voltar"));
    });
    expect(onBackForgot).toHaveBeenCalledTimes(1);
  });

  it("permite voltar ao login a partir do botão principal na tela de confirmação de e-mail (01.05)", async () => {
    const requestPasswordReset = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { requestPasswordReset });
    const onNavigateToSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword onNavigateToSignIn={onNavigateToSignIn} />);
    });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("E-mail"), "pessoa@exemplo.com");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Recuperar senha" }));
    });

    expect(screen.getByText("Confira seu e-mail")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar para o login" }));
    });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });
});
