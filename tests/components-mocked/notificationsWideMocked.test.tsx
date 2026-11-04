import { act, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Notifications from "@/view/notifications/notifications";

vi.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true }));

import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

describe("Notificações na web larga", () => {
  it("aviso de permissão ocupa a linha inteira e não espreme o estado vazio (regressão)", async () => {
    const state: NotificationsState = {
      notifications: [],
      filteredNotifications: [],
      loading: false,
      error: null,
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
});
