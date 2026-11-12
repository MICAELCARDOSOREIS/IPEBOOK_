import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Falha de uma ação (marcar, excluir, limpar); não substitui a lista carregada. */
  actionError: string | null;
  filter: NotificationFilter;
  unreadCount: number;
  /** Permissão de notificações concedida no aparelho (Spec 111). null se ainda não checada/web. */
  systemPermissionGranted: boolean | null;
};

export type NotificationsActions = {
  reload: () => Promise<void>;
  /** Recarrega sem esconder a lista (puxar para atualizar). */
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  clearRead: () => Promise<void>;
  clearActionError: () => void;
  setFilter: (filter: NotificationFilter) => void;
};

const sessionNotificationsCache = new Map<string, readonly AppNotification[]>();

export function clearSessionNotificationsCache(userId?: string): void {
  if (userId) {
    sessionNotificationsCache.delete(userId);
  } else {
    sessionNotificationsCache.clear();
  }
}

export function useNotificationsViewModel(
  sessionUserId: string | null,
  useCases: INotificationUseCases,
  push: IPushNotificationService,
): [NotificationsState, NotificationsActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached =
    !isTest && sessionUserId ? (sessionNotificationsCache.get(sessionUserId) ?? null) : null;
  const [notifications, setNotifications] = useState<readonly AppNotification[]>(
    initialCached ?? [],
  );
  const [loading, setLoading] = useState(initialCached === null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [systemPermissionGranted, setSystemPermissionGranted] = useState<boolean | null>(null);

  const active = useRef(false);
  const request = useRef(0);

  useEffect(() => {
    let isMounted = true;
    void push
      .getPermissions()
      .then((granted) => {
        if (isMounted) setSystemPermissionGranted(granted);
      })
      .catch(() => {
        if (isMounted) setSystemPermissionGranted(null);
      });
    return () => {
      isMounted = false;
    };
  }, [push]);

  const load = useCallback(async (silent: boolean) => {
    if (!sessionUserId) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }
    const current = ++request.current;
    if (!silent) {
      setLoading((prevLoading) => prevLoading || (!isTest && !sessionNotificationsCache.has(sessionUserId)));
      setError(null);
    }
    try {
      const items = await useCases.listNotifications(sessionUserId);
      if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, items);
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
        setNotifications((prev) => {
          const next = prev.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          );
          if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, next);
          return next;
        });
      } catch (err) {
        setActionError(
          err instanceof DomainError
            ? err.message
            : "Não foi possível marcar a notificação como lida.",
        );
      }
    },
    [sessionUserId, useCases, isTest],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await useCases.markAllAsRead(sessionUserId);
      setNotifications((prev) => {
        const next = prev.map((item) => ({ ...item, read: true }));
        if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, next);
        return next;
      });
    } catch (err) {
      setActionError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível marcar todas as notificações como lidas.",
      );
    }
  }, [sessionUserId, useCases, isTest]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await useCases.deleteNotification(sessionUserId, notificationId);
        setNotifications((prev) => {
          const next = prev.filter((item) => item.id !== notificationId);
          if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, next);
          return next;
        });
      } catch (err) {
        setActionError(
          err instanceof DomainError
            ? err.message
            : "Não foi possível excluir a notificação.",
        );
      }
    },
    [sessionUserId, useCases, isTest],
  );

  const clearAll = useCallback(async () => {
    try {
      await useCases.clearAll(sessionUserId);
      if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, []);
      setNotifications([]);
    } catch (err) {
      setActionError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível limpar as notificações.",
      );
    }
  }, [sessionUserId, useCases, isTest]);

  const clearRead = useCallback(async () => {
    try {
      await useCases.clearRead(sessionUserId);
      setNotifications((prev) => {
        const next = prev.filter((item) => !item.read);
        if (!isTest && sessionUserId) sessionNotificationsCache.set(sessionUserId, next);
        return next;
      });
    } catch (err) {
      setActionError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível limpar as notificações lidas.",
      );
    }
  }, [sessionUserId, useCases, isTest]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

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
      actionError,
      filter,
      unreadCount,
      systemPermissionGranted,
    },
    {
      reload,
      refresh,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      clearRead,
      clearActionError,
      setFilter,
    },
  ];
}
