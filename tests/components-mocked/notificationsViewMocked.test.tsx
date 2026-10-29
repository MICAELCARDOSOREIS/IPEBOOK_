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
    ...state,
  };
  const fullActions: NotificationsActions = {
    reload: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
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
