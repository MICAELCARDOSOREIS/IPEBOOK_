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

    expect(screen.getByRole("header").props.children).toBe("Sua próxima leitura começa aqui.");
    expect(screen.getByText("Entre com o e-mail e a senha da sua conta.")).toBeDefined();
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
      fireEvent.press(screen.getByText("Criar uma conta"));
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
      fireEvent.press(screen.getByText("Esqueci minha senha"));
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

    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("IpêBook");
    expect(headers).toContain("Crie sua conta");
    expect(screen.getAllByText("Criar conta").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Nome completo")).toBeDefined();
    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Senha")).toBeDefined();
    expect(screen.getByRole("checkbox", { name: "Aceito os termos de uso" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeDefined();
    expect(screen.getByText("ou crie com e-mail")).toBeDefined();
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
      fireEvent.changeText(screen.getByLabelText("Nome completo"), "Ana Paula");
      fireEvent.changeText(screen.getByLabelText("E-mail"), "nova@exemplo.com");
      fireEvent.changeText(screen.getByLabelText("Senha"), "12345678");
      fireEvent.press(screen.getByRole("checkbox", { name: "Aceito os termos de uso" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Criar conta" }));
    });

    expect(signUp).toHaveBeenCalledWith("nova@exemplo.com", "12345678", "Ana Paula");
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
      fireEvent.press(screen.getByText("Já tenho conta"));
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

    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("IpêBook");
    // Manchete com faixa de realce (Figma 01.04): o texto fica em duas partes,
    // então a leitura acessível vem do rótulo do cabeçalho.
    expect(screen.getByLabelText("Recupere seu acesso.")).toBeDefined();
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
      fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    });

    expect(requestPasswordReset).toHaveBeenCalledWith("pessoa@exemplo.com");
    expect(screen.getByText("Não chegou?")).toBeDefined();
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
      fireEvent.press(screen.getByText("Voltar ao login"));
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
      fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    });

    expect(screen.getByText("Confira seu e-mail.")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar ao login" }));
    });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });
});

describe("Spec 030 — telas de acesso alinhadas ao Figma", () => {
  it("não cria conta sem o aceite explícito dos termos (01.03)", async () => {
    const signUp = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { signUp });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp />);
    });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Nome completo"), "Ana Paula");
      fireEvent.changeText(screen.getByLabelText("E-mail"), "nova@exemplo.com");
      fireEvent.changeText(screen.getByLabelText("Senha"), "12345678");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Criar conta" }));
    });

    expect(signUp).not.toHaveBeenCalled();
    expect(screen.getByText("É preciso aceitar os termos de uso para criar a conta.")).toBeDefined();
  });

  it("limpa o erro dos termos quando a pessoa aceita (01.03)", async () => {
    const signUp = vi.fn().mockResolvedValue(true);
    mockAuth({ user: null, loading: false, error: null }, { signUp });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp />);
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Criar conta" }));
    });
    expect(screen.getByText("É preciso aceitar os termos de uso para criar a conta.")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("checkbox", { name: "Aceito os termos de uso" }));
    });
    expect(screen.queryByText("É preciso aceitar os termos de uso para criar a conta.")).toBeNull();
  });

  it("abre os termos de uso a partir do cadastro (01.03)", async () => {
    mockAuth({ user: null, loading: false, error: null });
    const onNavigateToTerms = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SignUp onNavigateToTerms={onNavigateToTerms} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Ler os termos de uso e a política de privacidade"));
    });

    expect(onNavigateToTerms).toHaveBeenCalledTimes(1);
  });

  it("mostra o endereço informado e o contador de reenvio (01.05)", async () => {
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
      fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    });

    expect(screen.getByText("pessoa@exemplo.com")).toBeDefined();
    expect(screen.getByText("Você pode reenviar o link em 0:45.")).toBeDefined();
  });

  it("volta ao formulário pela ação Corrigir e-mail (01.05)", async () => {
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
      fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    });
    expect(screen.queryByLabelText("E-mail")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Corrigir e-mail" }));
    });

    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("E-mail").props.value).toBe("pessoa@exemplo.com");
  });
});

describe("Spec 030 — reenvio do link de recuperação (01.05)", () => {
  it("libera o reenvio quando o contador chega a zero", async () => {
    vi.useFakeTimers();
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
      fireEvent.press(screen.getByRole("button", { name: "Enviar link" }));
    });

    expect(screen.getByText("Você pode reenviar o link em 0:45.")).toBeDefined();

    await act(async () => {
      vi.advanceTimersByTime(45_000);
    });

    expect(screen.queryByText("Você pode reenviar o link em 0:45.")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Reenviar link" }));
    });

    expect(requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Você pode reenviar o link em 0:45.")).toBeDefined();
    vi.useRealTimers();
  });
});
