import { describe, expect, it, vi } from "vitest";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { AppNotification } from "@/model/entities/notification";
import { AuthError, ValidationError } from "@/model/errors";
import { NotificationUseCases } from "@/usecase/notificationUseCases";

describe("NotificationUseCases", () => {
  const mockNotification: AppNotification = {
    id: "notif-1",
    userId: "user-1",
    title: "Livro solicitado",
    message: "Alguém solicitou seu livro",
    type: "request_received",
    read: false,
    createdAt: "2026-10-15T12:00:00Z",
  };

  const createMockDataSource = (
    overrides?: Partial<INotificationDataSource>,
  ): INotificationDataSource => ({
    listByUser: vi.fn(async () => [mockNotification]),
    markAsRead: vi.fn(async () => {}),
    markAllAsRead: vi.fn(async () => {}),
    addNotification: vi.fn(async () => {}),
    ...overrides,
  });

  describe("listNotifications", () => {
    it("lança AuthError se o usuário não estiver autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.listNotifications(null)).rejects.toThrow(AuthError);
      expect(ds.listByUser).not.toHaveBeenCalled();
    });

    it("retorna lista de notificações do usuário autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      const result = await useCases.listNotifications("user-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("notif-1");
      expect(ds.listByUser).toHaveBeenCalledWith("user-1");
    });
  });

  describe("markAsRead", () => {
    it("lança AuthError se o usuário não estiver autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.markAsRead(null, "notif-1")).rejects.toThrow(AuthError);
    });

    it("lança ValidationError se o id for vazio", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.markAsRead("user-1", "  ")).rejects.toThrow(ValidationError);
    });

    it("marca a notificação como lida com sucesso", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await useCases.markAsRead("user-1", "notif-1");
      expect(ds.markAsRead).toHaveBeenCalledWith("notif-1");
    });
  });

  describe("markAllAsRead", () => {
    it("lança AuthError se o usuário não estiver autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.markAllAsRead(null)).rejects.toThrow(AuthError);
    });

    it("marca todas como lidas com sucesso", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await useCases.markAllAsRead("user-1");
      expect(ds.markAllAsRead).toHaveBeenCalledWith("user-1");
    });
  });

  describe("deleteNotification", () => {
    it("lança AuthError se o usuário não estiver autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.deleteNotification(null, "notif-1")).rejects.toThrow(AuthError);
    });

    it("lança ValidationError se o identificador for vazio", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.deleteNotification("user-1", "   ")).rejects.toThrow(ValidationError);
    });

    it("exclui a notificação com sucesso", async () => {
      const deleteNotification = vi.fn(async () => {});
      const ds = createMockDataSource({ deleteNotification });
      const useCases = new NotificationUseCases(ds);

      await useCases.deleteNotification("user-1", "notif-1");
      expect(deleteNotification).toHaveBeenCalledWith("notif-1");
    });
  });

  describe("clearAll e clearRead", () => {
    it("lança AuthError ao tentar limpar sem usuário autenticado", async () => {
      const ds = createMockDataSource();
      const useCases = new NotificationUseCases(ds);

      await expect(useCases.clearAll(null)).rejects.toThrow(AuthError);
      await expect(useCases.clearRead(null)).rejects.toThrow(AuthError);
    });

    it("chama clearAll e clearRead no dataSource quando autenticado", async () => {
      const clearAll = vi.fn(async () => {});
      const clearRead = vi.fn(async () => {});
      const ds = createMockDataSource({ clearAll, clearRead });
      const useCases = new NotificationUseCases(ds);

      await useCases.clearAll("user-1");
      expect(clearAll).toHaveBeenCalledWith("user-1");

      await useCases.clearRead("user-1");
      expect(clearRead).toHaveBeenCalledWith("user-1");
    });
  });
});
