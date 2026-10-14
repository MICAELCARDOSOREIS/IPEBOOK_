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

    expect(screen.getByRole("header").props.children).toBe("Entrar");
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

    expect(screen.getByRole("header").props.children).toBe("Criar conta");
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

    expect(screen.getByRole("header").props.children).toBe("Esqueceu a senha?");
    expect(screen.getByLabelText("E-mail")).toBeDefined();
  });

  it("exibe a senha temporária após recuperar com sucesso", async () => {
    const requestPasswordReset = vi.fn().mockResolvedValue("abc12345");
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
    expect(screen.getByText("abc12345")).toBeDefined();
    expect(screen.queryByLabelText("E-mail")).toBeNull();
  });

  it("exibe erro quando o e-mail não corresponde a nenhuma conta", async () => {
    mockAuth(
      { user: null, loading: false, error: "Não há conta cadastrada com este e-mail." },
      { requestPasswordReset: vi.fn().mockResolvedValue(null) },
    );

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ForgotPassword />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Não há conta cadastrada com este e-mail.")).toBeDefined();
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
});
