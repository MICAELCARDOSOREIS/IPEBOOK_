import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Notifications from "@/view/notifications/notifications";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

describe("Notifications Component (Spec 015)", () => {
  it("exibe aviso de sessão necessária quando o usuário não estiver autenticado", async () => {
    const onLogin = vi.fn();
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <Notifications
          sessionUserId={null}
          onBack={onBack}
          onNavigateToLogin={onLogin}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Sessão necessária" })).toBeDefined();
    expect(screen.getByText(/Você precisa estar conectado à sua conta/)).toBeDefined();

    const loginBtn = screen.getByRole("button", { name: "Entrar na conta" });
    await act(async () => {
      fireEvent.press(loginBtn);
    });
    expect(onLogin).toHaveBeenCalledTimes(1);

    const backBtn = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderiza lista de notificações e abas de filtro para usuário autenticado", async () => {
    const onBack = vi.fn();
    const onAction = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <Notifications
          sessionUserId="user-1"
          onBack={onBack}
          onNavigateToAction={onAction}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Notificações" })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Todas/ })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Não lidas/ })).toBeDefined();

    // Filtra por não lidas
    const unreadTab = screen.getByRole("tab", { name: /Não lidas/ });
    await act(async () => {
      fireEvent.press(unreadTab);
    });

    // Clica no botão de marcar lidas se estiver visível
    const markAllBtn = screen.queryByRole("button", { name: "Marcar lidas" });
    if (markAllBtn) {
      await act(async () => {
        fireEvent.press(markAllBtn);
      });
    }

    // Clica em uma notificação para navegar
    const notifButtons = screen.getAllByRole("button");
    const itemBtn = notifButtons.find((btn) =>
      btn.props.accessibilityLabel?.includes("Dica de Segurança"),
    );
    if (itemBtn) {
      await act(async () => {
        fireEvent.press(itemBtn);
      });
      expect(onAction).toHaveBeenCalledWith("/ajuda");
    }

    // Clica em voltar
    const backBtn = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderiza NotificationsScreen integrando com estado de autenticação", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <NotificationsScreen
          onBack={() => {}}
          onNavigateToLogin={() => {}}
          onNavigateToAction={() => {}}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Notificações" })).toBeDefined();
  });
});
