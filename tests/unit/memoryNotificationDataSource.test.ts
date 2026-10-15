import { describe, expect, it } from "vitest";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import type { AppNotification } from "@/model/entities/notification";

describe("MemoryNotificationDataSource", () => {
  const initialItems: AppNotification[] = [
    {
      id: "n1",
      userId: "user-test",
      title: "Primeira",
      message: "Mensagem 1",
      type: "system",
      read: false,
      createdAt: "2026-10-10T10:00:00Z",
    },
    {
      id: "n2",
      userId: "user-test",
      title: "Segunda mais recente",
      message: "Mensagem 2",
      type: "safety_tip",
      read: false,
      createdAt: "2026-10-12T10:00:00Z",
    },
    {
      id: "n3",
      userId: "other-user",
      title: "Outro usuario",
      message: "Mensagem 3",
      type: "request_received",
      read: false,
      createdAt: "2026-10-13T10:00:00Z",
    },
  ];

  it("lista apenas as notificações do usuário ordenadas por data decrescente", async () => {
    const ds = new MemoryNotificationDataSource(initialItems);
    const result = await ds.listByUser("user-test");

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("n2");
    expect(result[1].id).toBe("n1");
  });

  it("marca uma notificação específica como lida", async () => {
    const ds = new MemoryNotificationDataSource(initialItems);
    await ds.markAsRead("n1");

    const result = await ds.listByUser("user-test");
    const n1 = result.find((item) => item.id === "n1");
    expect(n1?.read).toBe(true);

    // Notificação inexistente não lança erro
    await expect(ds.markAsRead("nao-existe")).resolves.toBeUndefined();
  });

  it("marca todas as notificações de um usuário como lidas sem afetar outros usuários", async () => {
    const ds = new MemoryNotificationDataSource(initialItems);
    await ds.markAllAsRead("user-test");

    const userTestItems = await ds.listByUser("user-test");
    expect(userTestItems.every((item) => item.read)).toBe(true);

    const otherItems = await ds.listByUser("other-user");
    expect(otherItems[0].read).toBe(false);
  });

  it("adiciona uma nova notificação no início", async () => {
    const ds = new MemoryNotificationDataSource(initialItems);
    const newNotif: AppNotification = {
      id: "n-nova",
      userId: "user-test",
      title: "Nova notificação",
      message: "Aviso importante",
      type: "request_accepted",
      read: false,
      createdAt: "2026-10-15T12:00:00Z",
    };

    await ds.addNotification(newNotif);
    const result = await ds.listByUser("user-test");

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("n-nova");
  });
});
