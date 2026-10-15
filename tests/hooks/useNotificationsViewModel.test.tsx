import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppNotification } from "@/model/entities/notification";
import { DomainError } from "@/model/errors";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

const mockNotifications: AppNotification[] = [
  {
    id: "n-1",
    userId: "user-1",
    title: "Solicitação recebida",
    message: "Novo pedido",
    type: "request_received",
    read: false,
    createdAt: "2026-10-15T12:00:00Z",
  },
  {
    id: "n-2",
    userId: "user-1",
    title: "Aviso de segurança",
    message: "IFPI Piripiri",
    type: "safety_tip",
    read: true,
    createdAt: "2026-10-14T12:00:00Z",
  },
];

function stubNotifications(overrides: Partial<INotificationUseCases> = {}): INotificationUseCases {
  return {
    listNotifications: vi.fn().mockResolvedValue(mockNotifications),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function renderHook(sessionUserId: string | null, useCases: INotificationUseCases) {
  let result!: ReturnType<typeof useNotificationsViewModel>;
  function HookProbe() {
    result = useNotificationsViewModel(sessionUserId, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  while (mounted.length > 0) {
    const r = mounted.pop();
    await act(async () => {
      r?.unmount();
    });
  }
});

describe("useNotificationsViewModel", () => {
  it("inicia vazio quando não há usuário autenticado", async () => {
    const useCases = stubNotifications();
    const hook = await renderHook(null, useCases);
    const [state] = hook.current;

    expect(state.loading).toBe(false);
    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(useCases.listNotifications).not.toHaveBeenCalled();
  });

  it("carrega notificações e calcula unreadCount corretamente para usuário autenticado", async () => {
    const useCases = stubNotifications();
    const hook = await renderHook("user-1", useCases);
    const [state] = hook.current;

    expect(state.loading).toBe(false);
    expect(state.notifications).toHaveLength(2);
    expect(state.unreadCount).toBe(1);
    expect(state.filter).toBe("all");
    expect(state.filteredNotifications).toHaveLength(2);
  });

  it("filtra apenas não lidas quando filter é 'unread'", async () => {
    const useCases = stubNotifications();
    const hook = await renderHook("user-1", useCases);

    await act(async () => {
      hook.current[1].setFilter("unread");
    });

    const [state] = hook.current;
    expect(state.filter).toBe("unread");
    expect(state.filteredNotifications).toHaveLength(1);
    expect(state.filteredNotifications[0].id).toBe("n-1");
  });

  it("marca uma notificação como lida atualizando o estado reativo", async () => {
    const useCases = stubNotifications();
    const hook = await renderHook("user-1", useCases);

    await act(async () => {
      await hook.current[1].markAsRead("n-1");
    });

    const [state] = hook.current;
    expect(useCases.markAsRead).toHaveBeenCalledWith("user-1", "n-1");
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.find((n) => n.id === "n-1")?.read).toBe(true);
  });

  it("marca todas as notificações como lidas", async () => {
    const useCases = stubNotifications();
    const hook = await renderHook("user-1", useCases);

    await act(async () => {
      await hook.current[1].markAllAsRead();
    });

    const [state] = hook.current;
    expect(useCases.markAllAsRead).toHaveBeenCalledWith("user-1");
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every((n) => n.read)).toBe(true);
  });

  it("captura DomainError ao falhar no carregamento", async () => {
    const useCases = stubNotifications({
      listNotifications: vi.fn().mockRejectedValue(new DomainError("Erro ao listar")),
    });

    const hook = await renderHook("user-1", useCases);
    const [state] = hook.current;

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Erro ao listar");
  });

  it("captura erro genérico ao falhar em markAsRead", async () => {
    const useCases = stubNotifications({
      markAsRead: vi.fn().mockRejectedValue(new Error("Falha inesperada")),
    });

    const hook = await renderHook("user-1", useCases);
    await act(async () => {
      await hook.current[1].markAsRead("n-1");
    });

    const [state] = hook.current;
    expect(state.error).toBe("Não foi possível marcar a notificação como lida.");
  });

  it("captura erro genérico ao falhar em markAllAsRead", async () => {
    const useCases = stubNotifications({
      markAllAsRead: vi.fn().mockRejectedValue(new Error("Falha inesperada")),
    });

    const hook = await renderHook("user-1", useCases);
    await act(async () => {
      await hook.current[1].markAllAsRead();
    });

    const [state] = hook.current;
    expect(state.error).toBe("Não foi possível marcar todas as notificações como lidas.");
  });
});
