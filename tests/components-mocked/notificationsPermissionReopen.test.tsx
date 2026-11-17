import { act, fireEvent, render } from "@testing-library/react-native";
import { PERMISSION_PROMPT_COPY } from "@/view/components/PermissionPromptDialog";
import Notifications from "@/view/notifications/notifications";
import type {
  NotificationsActions,
  NotificationsState,
} from "@/viewmodel/useNotificationsViewModel";
import type {
  PermissionPromptActions,
  PermissionPromptState,
} from "@/viewmodel/usePermissionPromptViewModel";

jest.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: jest.fn() }));
jest.mock("@/viewmodel/usePermissionPromptViewModel", () => ({ usePermissionPromptViewModel: jest.fn() }));

import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { usePermissionPromptViewModel } from "@/viewmodel/usePermissionPromptViewModel";

const prompt: PermissionPromptState & { actions: PermissionPromptActions } = {
  status: "idle",
  granted: false,
  actions: {
    refresh: jest.fn(),
    approve: jest.fn(),
    decline: jest.fn(),
    dismiss: jest.fn(),
    reopen: jest.fn(),
  },
};

function tela(permissionNoAparelho: boolean | null) {
  const state: NotificationsState = {
    notifications: [],
    filteredNotifications: [],
    loading: false,
    error: null,
    actionError: null,
    filter: "all",
    unreadCount: 0,
    systemPermissionGranted: permissionNoAparelho,
  };
  const actions: NotificationsActions = {
    reload: jest.fn(),
    refresh: jest.fn().mockResolvedValue(undefined),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearAll: jest.fn(),
    clearRead: jest.fn(),
    clearActionError: jest.fn(),
    setFilter: jest.fn(),
  };
  jest.mocked(useNotificationsViewModel).mockReturnValue([state, actions]);
}

beforeEach(() => {
  jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  prompt.status = "idle";
  prompt.granted = false;
  for (const fn of Object.values(prompt.actions)) (fn as ReturnType<typeof jest.fn>).mockReset();
  jest.mocked(usePermissionPromptViewModel).mockReturnValue([
    { status: prompt.status, granted: prompt.granted },
    prompt.actions,
  ]);
});

describe("Central de notificações: reabrir o aviso de permissão (Spec 127)", () => {
  it("oferece o controle na banner quando o aparelho está sem a permissão", async () => {
    tela(false);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.getByText("Notificações desativadas")).toBeDefined();
    expect(screen.getByLabelText("Pedir permissão de avisos novamente ao aparelho")).toBeDefined();
  });

  it("não mostra o controle nem abre aviso por conta própria quando a permissão está concedida", async () => {
    tela(true);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.queryByText("Notificações desativadas")).toBeNull();
    expect(prompt.actions.reopen).not.toHaveBeenCalled();
    expect(screen.queryByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeNull();
  });

  it("tocar no controle reabre a explicação e o prompt nativo só sai do 'Permitir avisos'", async () => {
    tela(false);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.queryByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Pedir permissão de avisos novamente ao aparelho"));
    });
    expect(prompt.actions.reopen).toHaveBeenCalledTimes(1);

    // O ViewModel passa a reportar a explicação aberta: a tela é a mesma do fluxo da Spec 020.
    prompt.status = "explain";
    jest.mocked(usePermissionPromptViewModel).mockReturnValue([
      { status: "explain", granted: false },
      prompt.actions,
    ]);
    await act(async () => {
      screen.rerender(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.message)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.allow));
    });
    expect(prompt.actions.approve).toHaveBeenCalledTimes(1);
  });

  it("some o controle quando o próprio aviso já registra a concessão, sem recarregar a tela", async () => {
    tela(false);
    prompt.granted = true;
    jest.mocked(usePermissionPromptViewModel).mockReturnValue([
      { status: "idle", granted: true },
      prompt.actions,
    ]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.queryByText("Notificações desativadas")).toBeNull();
  });
});
