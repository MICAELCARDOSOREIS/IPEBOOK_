import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Notifications from "@/view/notifications/notifications";
import ResetPassword from "@/view/auth/resetPassword";
import SearchAlerts from "@/view/search/searchAlerts";

describe("Spec 039 — alinhamento fino das telas do Micael ao Figma", () => {
  it("mostra o cartão do alerta ativo com a frase da busca (02.07)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <SearchAlerts
          userId="usuario-038-alerta"
          initialQuery="Astronomia"
          onBack={vi.fn()}
          onLogin={vi.fn()}
          onManageAlert={vi.fn()}
        />,
      );
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Criar alerta" }));
    });

    expect(screen.getByText("Alerta ativo")).toBeDefined();
    expect(
      screen.getByText(
        "Você recebe uma notificação quando um novo livro corresponde à busca por Astronomia.",
      ),
    ).toBeDefined();
  });

  it("não acrescenta manchete à lista de notificações (07.04)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Notifications sessionUserId="usuario-038-notificacoes" onBack={vi.fn()} />,
      );
    });

    expect(screen.queryByText("Novidades dos seus livros.")).toBeNull();
  });

  it("não exibe apoio no campo de confirmação de senha (01.06)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ResetPassword
          link="ipebook://redefinir-senha?code=038"
          onBack={vi.fn()}
          onNavigateToSignIn={vi.fn()}
        />,
      );
    });

    expect(screen.queryByText("Digite a mesma senha novamente.")).toBeNull();
    expect(screen.getByText("Use uma senha que você não usa em outro lugar.")).toBeDefined();
  });
});
