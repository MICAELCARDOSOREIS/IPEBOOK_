import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Notifications from "@/view/notifications/notifications";

jest.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280 }));

import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

describe("Notificações na web larga", () => {
  it("mostra a situação atual e mantém um aviso anterior não lido acessível no histórico", async () => {
    const latest = {
      id: "latest", userId: "u1", title: "Convite para encontro", message: "Primeiro local",
      type: "meeting_update" as const, read: true, createdAt: "2026-11-15T12:00:00Z",
      actionUrl: "/negociacao/r1",
    };
    const older = {
      ...latest, id: "older", title: "Encontro reagendado", message: "Aviso anterior",
      read: false, createdAt: "2026-11-14T12:00:00Z",
    };
    const meeting = {
      id: "m1", requestId: "r1", pointName: "Praça da Bandeira",
      scheduledAt: "2026-11-27T18:00:00Z", proposedBy: "u2", status: "confirmed" as const,
    };
    const state = {
      notifications: [latest, older], filteredNotifications: [older],
      loading: false, error: null, actionError: null, filter: "unread" as const,
      unreadCount: 1, systemPermissionGranted: true, meetingsByRequest: new Map([["r1", meeting]]),
    };
    const actions: NotificationsActions = {
      reload: jest.fn(), refresh: jest.fn(), markAsRead: jest.fn(), markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(), clearAll: jest.fn(), clearRead: jest.fn(),
      clearActionError: jest.fn(), setFilter: jest.fn(),
    };
    jest.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);
    const onNavigateToAction = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onNavigateToAction={onNavigateToAction} />);
    });
    expect(screen.getByText("Encontro confirmado")).toBeDefined();
    expect(screen.getByText(/Praça da Bandeira/)).toBeDefined();
    expect(screen.queryByText("Encontro reagendado")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByText(/Ver histórico/)); });
    expect(screen.getByText("Encontro reagendado")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Ver encontro")); });
    expect(onNavigateToAction).toHaveBeenCalledWith("/conversa/r1");
  });

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
      reload: jest.fn(),
      refresh: jest.fn().mockResolvedValue(undefined),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      clearAll: jest.fn(),
      clearRead: jest.fn(),
      clearActionError: jest.fn(),
      setFilter: jest.fn(),
    } satisfies NotificationsActions;
    jest.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });

    const banner = StyleSheet.flatten(screen.getByTestId("permission-alert").props.style);
    expect(banner.width).toBe("100%");
    const row = StyleSheet.flatten(screen.getByTestId("permission-alert").parent?.props.style);
    expect(row.flexDirection ?? "column").toBe("column");
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
      reload: jest.fn(),
      refresh: jest.fn().mockResolvedValue(undefined),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAllAsRead: jest.fn().mockResolvedValue(undefined),
      deleteNotification: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
      clearRead: jest.fn().mockResolvedValue(undefined),
      clearActionError: jest.fn(),
      setFilter: jest.fn(),
    } satisfies NotificationsActions;
    jest.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
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
      reload: jest.fn(),
      refresh: jest.fn().mockResolvedValue(undefined),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      clearAll: jest.fn(),
      clearRead: jest.fn(),
      clearActionError: jest.fn(),
      setFilter: jest.fn(),
    } satisfies NotificationsActions;
    jest.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });

    const mainStyle = StyleSheet.flatten(screen.getByTestId("notifications-main").props.style);
    expect(mainStyle.width).toBe("100%");
    expect(mainStyle.maxWidth).toBeUndefined();
    expect(mainStyle.alignItems).toBe("center");
    expect(screen.getByText("Você está em dia")).toBeDefined();
  });
});
