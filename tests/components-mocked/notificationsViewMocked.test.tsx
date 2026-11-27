
import { act, fireEvent, render } from "@testing-library/react-native";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Notifications from "@/view/notifications/notifications";

jest.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: jest.fn() }));

import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

function mock(state: Partial<NotificationsState>, actions: Partial<NotificationsActions> = {}) {
  const fullState: NotificationsState = {
    notifications: [],
    filteredNotifications: [],
    loading: false,
    error: null,
    actionError: null,
    filter: "all",
    unreadCount: 0,
    systemPermissionGranted: true,
    ...state,
  };
  const fullActions: NotificationsActions = {
    reload: jest.fn(),
    refresh: jest.fn().mockResolvedValue(undefined),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearAll: jest.fn(),
    clearRead: jest.fn(),
    clearActionError: jest.fn(),
    setFilter: jest.fn(),
    ...actions,
  };
  jest.mocked(useNotificationsViewModel).mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("Notifications com ViewModel mockado (Issue #76)", () => {
  it("mostra o erro genérico com ação de tentar de novo quando online", async () => {
    mock({ error: "Não foi possível carregar notificações." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
    });
    expect(screen.getByText("Não foi possível carregar notificações.")).toBeDefined();
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline", async () => {
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mock({ error: "Não foi possível carregar notificações." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u1" onBack={jest.fn()} />);
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

  it("mantém a lista visível quando uma ação falha e só avisa pelo snackbar", async () => {
    mock({
      notifications: [item],
      filteredNotifications: [item],
      unreadCount: 1,
      actionError: "Não foi possível excluir a notificação.",
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u" />);
    });

    expect(screen.getByText("Nova proposta")).toBeDefined();
    expect(screen.getByText("Não foi possível excluir a notificação.")).toBeDefined();
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

describe("Notifications — estado vazio leva ao catálogo", () => {
  it("pressiona 'Explorar livros' e chama a ação da rota, não o retorno", async () => {
    mock({});
    const onBack = jest.fn();
    const onExploreBooks = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Notifications sessionUserId="u" onBack={onBack} onExploreBooks={onExploreBooks} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Explorar livros" }));
    });

    expect(onExploreBooks).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });
});
