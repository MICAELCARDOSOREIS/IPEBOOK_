import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Notifications from "@/view/notifications/notifications";

vi.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280 }));

import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

describe("Notificações na web larga", () => {
  it("aviso de permissão ocupa a linha inteira e não espreme o estado vazio (regressão)", async () => {
    const state: NotificationsState = {
      notifications: [],
      filteredNotifications: [],
      loading: false,
      error: null,
      actionError: null,
      filter: "all",
      unreadCount: 0,
      systemPermissionGranted: false,
    };
    const actions = {
      reload: vi.fn(),
      refresh: vi.fn().mockResolvedValue(undefined),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      clearAll: vi.fn(),
      clearRead: vi.fn(),
      clearActionError: vi.fn(),
      setFilter: vi.fn(),
    } satisfies NotificationsActions;
    vi.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={vi.fn()} />);
    });

    const banner = StyleSheet.flatten(screen.getByTestId("permission-alert").props.style);
    expect(banner.width).toBe("100%");
    const row = StyleSheet.flatten(screen.getByTestId("permission-alert").parent?.props.style);
    expect(row.flexWrap).toBe("wrap");
    expect(screen.getByText("Você está em dia")).toBeDefined();
  });

  it("exibe botão Atualizar no cabeçalho web largo, selo Nova e ação individual de leitura", async () => {
    const unreadItem = {
      id: "n-1",
      userId: "u1",
      title: "Nova proposta recebida",
      message: "Ana pediu seu livro Grande Sertão: Veredas.",
      type: "request_received" as const,
      read: false,
      createdAt: "2026-10-15T10:00:00.000Z",
      actionUrl: "/pedidos-recebidos",
    };
    const state: NotificationsState = {
      notifications: [unreadItem],
      filteredNotifications: [unreadItem],
      loading: false,
      error: null,
      actionError: null,
      filter: "all",
      unreadCount: 1,
      systemPermissionGranted: true,
    };
    const actions = {
      reload: vi.fn(),
      refresh: vi.fn().mockResolvedValue(undefined),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      markAllAsRead: vi.fn().mockResolvedValue(undefined),
      deleteNotification: vi.fn().mockResolvedValue(undefined),
      clearAll: vi.fn().mockResolvedValue(undefined),
      clearRead: vi.fn().mockResolvedValue(undefined),
      clearActionError: vi.fn(),
      setFilter: vi.fn(),
    } satisfies NotificationsActions;
    vi.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={vi.fn()} />);
    });

    expect(screen.getByText("Nova")).toBeDefined();

    const refreshBtn = screen.getByRole("button", { name: "Atualizar notificações" });
    await act(async () => {
      fireEvent.press(refreshBtn);
    });
    expect(actions.refresh).toHaveBeenCalledTimes(1);

    const markReadBtn = screen.getByTestId("mark-read-notif-n-1");
    await act(async () => {
      fireEvent.press(markReadBtn);
    });
    expect(actions.markAsRead).toHaveBeenCalledWith("n-1");
  });

  it("centraliza o estado vazio em toda a largura quando não há barra lateral", async () => {
    const state: NotificationsState = {
      notifications: [],
      filteredNotifications: [],
      loading: false,
      error: null,
      actionError: null,
      filter: "all",
      unreadCount: 0,
      systemPermissionGranted: true,
    };
    const actions = {
      reload: vi.fn(),
      refresh: vi.fn().mockResolvedValue(undefined),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
      clearAll: vi.fn(),
      clearRead: vi.fn(),
      clearActionError: vi.fn(),
      setFilter: vi.fn(),
    } satisfies NotificationsActions;
    vi.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={vi.fn()} />);
    });

    const mainStyle = StyleSheet.flatten(screen.getByTestId("notifications-main").props.style);
    expect(mainStyle.width).toBe("100%");
    expect(mainStyle.maxWidth).toBeUndefined();
    expect(mainStyle.alignItems).toBe("center");
    expect(screen.getByText("Você está em dia")).toBeDefined();
  });
});
