import { useCallback, useEffect, useRef, useState } from "react";
import { notificationUseCases, pushNotificationService } from "@/di/container";
import type { AppNotification } from "@/model/entities/notification";
import type { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { DomainError } from "@/model/errors";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";

export type NotificationFilter = "all" | "unread";

export type NotificationsState = {
  notifications: readonly AppNotification[];
  filteredNotifications: readonly AppNotification[];
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;
  unreadCount: number;
};

export type NotificationsActions = {
  reload: () => Promise<void>;
  /** Recarrega sem esconder a lista (puxar para atualizar). */
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setFilter: (filter: NotificationFilter) => void;
};

export function useNotificationsViewModel(
  sessionUserId: string | null,
  useCases: INotificationUseCases = notificationUseCases,
  push: IPushNotificationService = pushNotificationService,
): [NotificationsState, NotificationsActions] {
  const [notifications, setNotifications] = useState<readonly AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const active = useRef(false);
  const request = useRef(0);

  const load = useCallback(async (silent: boolean) => {
    if (!sessionUserId) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }
    const current = ++request.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const items = await useCases.listNotifications(sessionUserId);
      if (active.current && current === request.current) {
        setNotifications(items);
        setLoading(false);
      }
    } catch (err) {
      if (active.current && current === request.current) {
        setLoading(false);
        setError(
          err instanceof DomainError
            ? err.message
            : "Não foi possível carregar as notificações. Tente novamente.",
        );
      }
    }
  }, [sessionUserId, useCases]);

  const reload = useCallback(() => load(false), [load]);
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
    };
  }, [reload]);

  // Tempo real (Spec 086): notificação nova ou alterada recarrega a lista sem piscar o carregamento
  useEffect(() => {
    if (!sessionUserId || !useCases.subscribe) return;
    return useCases.subscribe(sessionUserId, () => void load(true));
  }, [sessionUserId, useCases, load]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await useCases.markAsRead(sessionUserId, notificationId);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
        );
      } catch (err) {
        setError(
          err instanceof DomainError
            ? err.message
            : "Não foi possível marcar a notificação como lida.",
        );
      }
    },
    [sessionUserId, useCases],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await useCases.markAllAsRead(sessionUserId);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível marcar todas as notificações como lidas.",
      );
    }
  }, [sessionUserId, useCases]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  // Selo do app acompanha as não lidas (Spec 099): zera ao entrar sem sessão e ao ler tudo.
  useEffect(() => {
    if (!sessionUserId) {
      void push.setBadgeCount(0);
      return;
    }
    void push.setBadgeCount(unreadCount);
  }, [sessionUserId, unreadCount, push]);

  return [
    {
      notifications,
      filteredNotifications,
      loading,
      error,
      filter,
      unreadCount,
    },
    {
      reload,
      refresh,
      markAsRead,
      markAllAsRead,
      setFilter,
    },
  ];
}
