import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import { describe, expect, it, vi } from "vitest";
import DeleteAccount from "@/view/auth/deleteAccount";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";

vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///dados/",
  writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("expo-sharing", () => ({
  isAvailableAsync: vi.fn().mockResolvedValue(true),
  shareAsync: vi.fn().mockResolvedValue(undefined),
}));

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

  it("exibe card de portabilidade e botão para baixar dados em JSON (Spec 029 - LGPD)", async () => {
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

    // Spec 039 (RN-08): `07.07` reduz a portabilidade à ação de rodapé; o rótulo acessível do
    // botão é o que identifica a exportação, no lugar do cabeçalho de seção.
    const downloadBtn = screen.getByRole("button", { name: "Baixar meus dados pessoais em formato JSON" });
    expect(downloadBtn).toBeDefined();
    await act(async () => {
      fireEvent.press(downloadBtn);
    });
    expect(screen.getByText(/Resumo exportado:/)).toBeDefined();
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

    expect(screen.getByRole("header", { name: "Privacidade e dados" })).toBeDefined();
  });

  it("oferece o atalho de editar informações do perfil (Figma 07.07, Spec 032)", async () => {
    const onEditProfile = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount
          sessionUserId="user-1"
          onBack={() => {}}
          onAccountDeleted={() => {}}
          onEditProfile={onEditProfile}
        />,
      );
    });

    expect(screen.getByText("Solicitar meus dados")).toBeDefined();

    await act(async () => {
      fireEvent.press(
        screen.getByLabelText("Editar informações do perfil: atualize nome e bairro"),
      );
    });

    expect(onEditProfile).toHaveBeenCalledTimes(1);
  });

  it("anuncia e foca o erro ao tentar excluir sem marcar a confirmação (Spec 042 / Issue #147)", async () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <DeleteAccount sessionUserId="user-1" onBack={() => {}} onAccountDeleted={() => {}} />,
      );
    });

    const submitBtn = screen.getByRole("button", { name: "Confirmar e excluir minha conta" });
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    const errorText = screen.getByRole("alert");
    expect(errorText.props.accessibilityLiveRegion).toBe("assertive");
    expect(announceSpy).toHaveBeenCalledWith(errorText.props.children);

    announceSpy.mockRestore();
  });
});
