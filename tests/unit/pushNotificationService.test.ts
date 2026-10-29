import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryPushNotificationService } from "@/infra/services/memoryPushNotificationService";
import { ExpoPushNotificationService } from "@/infra/services/expoPushNotificationService";
import * as Notifications from "expo-notifications";

describe("PushNotificationService (Spec 060 / ADR 0043)", () => {
  describe("MemoryPushNotificationService", () => {
    it("gerencia permissões corretamente", async () => {
      const service = new MemoryPushNotificationService(false);
      expect(await service.getPermissions()).toBe(false);
      expect(await service.registerForPushNotifications()).toBeNull();
      expect(await service.scheduleLocalNotification({ title: "Teste", body: "Msg" })).toBeNull();

      expect(await service.requestPermissions()).toBe(true);
      expect(await service.getPermissions()).toBe(true);
      expect(await service.registerForPushNotifications()).toBe("ExponentPushToken[mock-local-token]");
    });

    it("agenda notificação local e cancela com sucesso", async () => {
      const service = new MemoryPushNotificationService(true);
      const id = await service.scheduleLocalNotification({
        title: "Nova Proposta",
        body: "Você recebeu uma proposta para Dom Casmurro",
        data: { requestId: "req-1" },
        triggerSeconds: 10,
      });

      expect(id).toMatch(/^local-notification-\d+$/);
      expect(service.getScheduledNotifications()).toHaveLength(1);
      expect(service.getScheduledNotifications()[0].options.title).toBe("Nova Proposta");

      const cancelled = await service.cancelScheduledNotification(id!);
      expect(cancelled).toBe(true);
      expect(service.getScheduledNotifications()).toHaveLength(0);

      const notFoundCancel = await service.cancelScheduledNotification("inexistente");
      expect(notFoundCancel).toBe(false);
    });

    it("agenda lembrete de encontro presencial com antecedência", async () => {
      const service = new MemoryPushNotificationService(true);
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // daqui a 2 horas

      const id = await service.scheduleMeetingReminder({
        meetingId: "meeting-123",
        bookTitle: "O Cortiço",
        locationName: "Praça da Bandeira",
        scheduledAt: futureDate,
        advanceMinutes: 60, // 1 hora antes
      });

      expect(id).toBeDefined();
      const scheduled = service.getScheduledNotifications()[0];
      expect(scheduled.options.title).toBe("Lembrete de Encontro no Ponto Seguro");
      expect(scheduled.options.body).toContain("O Cortiço");
      expect(scheduled.options.body).toContain("Praça da Bandeira");
      expect(scheduled.options.data?.meetingId).toBe("meeting-123");
      expect(scheduled.options.data?.type).toBe("meeting_update");
      expect(scheduled.options.triggerSeconds).toBeGreaterThan(0);
    });

    it("agenda para 5s se a antecedência já passou mas o encontro é no futuro", async () => {
      const service = new MemoryPushNotificationService(true);
      const nearFutureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // daqui a 10 min

      const id = await service.scheduleMeetingReminder({
        meetingId: "meeting-456",
        bookTitle: "Capitães da Areia",
        locationName: "Estação Ferroviária",
        scheduledAt: nearFutureDate,
        advanceMinutes: 60, // 60 min de antecedência quando o encontro é daqui a 10 min
      });

      expect(id).toBeDefined();
      const scheduled = service.getScheduledNotifications()[0];
      expect(scheduled.options.triggerSeconds).toBe(5);
    });

    it("não agenda se a data do encontro for inválida ou já estiver no passado", async () => {
      const service = new MemoryPushNotificationService(true);

      const invalidDateId = await service.scheduleMeetingReminder({
        meetingId: "m-1",
        bookTitle: "Livro",
        locationName: "Local",
        scheduledAt: "data-invalida",
      });
      expect(invalidDateId).toBeNull();

      const pastDate = new Date(Date.now() - 10000).toISOString();
      const pastDateId = await service.scheduleMeetingReminder({
        meetingId: "m-2",
        bookTitle: "Livro",
        locationName: "Local",
        scheduledAt: pastDate,
      });
      expect(pastDateId).toBeNull();
    });

    it("limpa todas as notificações agendadas", async () => {
      const service = new MemoryPushNotificationService(true);
      await service.scheduleLocalNotification({ title: "1", body: "1" });
      await service.scheduleLocalNotification({ title: "2", body: "2" });
      expect(service.getScheduledNotifications()).toHaveLength(2);

      service.clear();
      expect(service.getScheduledNotifications()).toHaveLength(0);
    });
  });

  describe("ExpoPushNotificationService", () => {
    let service: ExpoPushNotificationService;

    beforeEach(() => {
      vi.clearAllMocks();
      service = new ExpoPushNotificationService();
    });

    it("retorna permissões e solicita permissão nativa", async () => {
      expect(await service.getPermissions()).toBe(true);
      expect(await service.requestPermissions()).toBe(true);
    });

    it("registra e obtém token expo push", async () => {
      const token = await service.registerForPushNotifications();
      expect(token).toBe("ExponentPushToken[mock-token]");
    });

    it("agenda notificação local e cancela", async () => {
      const id = await service.scheduleLocalNotification({
        title: "Aviso",
        body: "Notificação local",
        triggerSeconds: 15,
      });

      expect(id).toBe("mock-notification-id");

      const success = await service.cancelScheduledNotification(id!);
      expect(success).toBe(true);
    });

    it("agenda lembrete de encontro presencial nativo", async () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const id = await service.scheduleMeetingReminder({
        meetingId: "m-expo",
        bookTitle: "Grande Sertão: Veredas",
        locationName: "Centro Cultural",
        scheduledAt: futureDate,
        advanceMinutes: 30,
      });

      expect(id).toBe("mock-notification-id");
    });
  });
});
