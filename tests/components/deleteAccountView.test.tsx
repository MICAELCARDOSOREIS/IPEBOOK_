import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import DeleteAccount from "@/view/auth/deleteAccount";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";

describe("tela de exclusão de conta (DeleteAccount - LGPD)", () => {
  it("exibe aviso de sessão necessária quando o usuário não estiver autenticado", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount
          sessionUserId={null}
          onBack={() => {}}
          onAccountDeleted={() => {}}
          onNavigateToLogin={onLogin}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Sessão necessária" })).toBeDefined();
    expect(screen.getByText(/Você precisa entrar na sua conta/)).toBeDefined();

    const loginBtn = screen.getByRole("button", { name: "Entrar na conta" });
    await act(async () => {
      fireEvent.press(loginBtn);
    });
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("renderiza avisos de consequências e regras da LGPD quando autenticado", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount
          sessionUserId="user-1"
          onBack={() => {}}
          onAccountDeleted={() => {}}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Atenção: Ação irreversível" })).toBeDefined();
    expect(screen.getByText(/Todos os seus anúncios ativos serão cancelados/)).toBeDefined();
    expect(screen.getByText(/Seus dados cadastrais serão definitivamente eliminados/)).toBeDefined();
  });

  it("permite marcar checkbox de confirmação e acionar o botão de exclusão", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount
          sessionUserId="user-1"
          onBack={() => {}}
          onAccountDeleted={() => {}}
        />,
      );
    });

    const checkbox = screen.getByRole("checkbox");
    await act(async () => {
      fireEvent.press(checkbox);
    });

    const submitBtn = screen.getByRole("button", {
      name: "Confirmar e excluir minha conta",
    });
    expect(submitBtn).toBeDefined();
  });

  it("aciona callback onBack na barra superior", async () => {
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount
          sessionUserId="user-1"
          onBack={onBack}
          onAccountDeleted={() => {}}
        />,
      );
    });

    const backBtn = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("DeleteAccountScreen integra com o estado de autenticação", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccountScreen
          onBack={() => {}}
          onAccountDeleted={() => {}}
          onNavigateToLogin={() => {}}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Exclusão de Conta" })).toBeDefined();
  });
});
