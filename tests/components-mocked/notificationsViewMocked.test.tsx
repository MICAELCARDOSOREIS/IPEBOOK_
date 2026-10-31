import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Notifications from "@/view/notifications/notifications";

vi.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

function mock(state: Partial<NotificationsState>, actions: Partial<NotificationsActions> = {}) {
  const fullState: NotificationsState = {
    notifications: [],
    filteredNotifications: [],
    loading: false,
    error: null,
    filter: "all",
    unreadCount: 0,
    systemPermissionGranted: true,
    ...state,
  };
  const fullActions: NotificationsActions = {
    reload: vi.fn(),
    refresh: vi.fn().mockResolvedValue(undefined),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    clearAll: vi.fn(),
    clearRead: vi.fn(),
    setFilter: vi.fn(),
    ...actions,
  };
  vi.mocked(useNotificationsViewModel).mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("Notifications com ViewModel mockado (Issue #76)", () => {
  it("mostra o erro genérico com ação de tentar de novo quando online", async () => {
    mock({ error: "Não foi possível carregar notificações." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={vi.fn()} />);
    });
    expect(screen.getByText("Não foi possível carregar notificações.")).toBeDefined();
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mock({ error: "Não foi possível carregar notificações." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={vi.fn()} />);
    });
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
  });
});

describe("Notifications — puxar para atualizar e rótulos (Spec 091)", () => {
  const item = { id: "n1", userId: "u", title: "Nova proposta", message: "Ana quer seu livro", type: "request_received", read: false, createdAt: new Date().toISOString() } as const;

  it("recarrega sem esconder a lista ao puxar para atualizar", async () => {
    const actions = mock({ notifications: [item], filteredNotifications: [item], unreadCount: 1 });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u" />);
    });
    await act(async () => {
      await screen.getByTestId("notifications-list").props.onRefresh();
    });
    expect(actions.refresh).toHaveBeenCalledTimes(1);
  });

  it("oferece 'Marcar todas como lidas' e não repete a contagem de pendentes", async () => {
    mock({ notifications: [item], filteredNotifications: [item], unreadCount: 1 });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u" />);
    });
    expect(screen.getByLabelText("Marcar todas como lidas")).toBeDefined();
    expect(screen.queryByText("1 alerta pendente de leitura")).toBeNull();
  });
});
