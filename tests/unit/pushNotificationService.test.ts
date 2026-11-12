import { createRequire } from "node:module";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { MemoryPushNotificationService } from "@/infra/services/memoryPushNotificationService";
import { ExpoPushNotificationService } from "@/infra/services/expoPushNotificationService";
import * as Notifications from "expo-notifications";

// O serviço carrega `expo-notifications` por `require`; o teste pega a mesma instância para controlar a resposta e a escuta.
const mockState = (createRequire(import.meta.url)("expo-notifications") as {
  __mock: {
    lastResponse: unknown;
    listener?: (r: unknown) => void;
    removed: number;
    lastBadge?: number;
    channels: Array<{ channelId: string; channel: unknown }>;
  };
}).__mock;
const tap = (url: unknown) => ({ notification: { request: { content: { data: { url } } } } });

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

    it("avisa o toque na notificação a quem escuta e para depois de cancelar", () => {
      const service = new MemoryPushNotificationService(true);
      const vistos: Array<string | null> = [];
      const cancelar = service.subscribeToOpened(({ url }) => vistos.push(url));
      service.simulateOpened("/negociacao/r1");
      cancelar();
      service.simulateOpened("/negociacao/r2");
      expect(vistos).toEqual(["/negociacao/r1"]);
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
      // Espec 099: lembrete de encontro toca no canal "reminders", com o seu próprio comportamento.
      expect(scheduled.options.channelId).toBe("reminders");
    });

    it("ajusta o selo de não lidos e ignora valores inválidos (Spec 099)", async () => {
      const service = new MemoryPushNotificationService(true);
      expect(service.getBadgeCount()).toBe(0);

      await service.setBadgeCount(3);
      expect(service.getBadgeCount()).toBe(3);

      await service.setBadgeCount(-2);
      expect(service.getBadgeCount()).toBe(0);

      await service.setBadgeCount(4.7);
      expect(service.getBadgeCount()).toBe(4);

      service.clear();
      expect(service.getBadgeCount()).toBe(0);
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

    it("avisa o toque na notificação com a rota do aviso e cancela a escuta (Spec 096, CA3)", () => {
      mockState.lastResponse = null;
      const aberturas: Array<string | null> = [];
      const cancelar = service.subscribeToOpened(({ url }) => aberturas.push(url));
      mockState.listener?.(tap("/negociacao/r1"));
      mockState.listener?.(tap(42));
      expect(aberturas).toEqual(["/negociacao/r1", null]);
      const antes = mockState.removed;
      cancelar();
      expect(mockState.removed).toBe(antes + 1);
    });

    it("com o app aberto pelo toque, entrega a última resposta que chegou antes da escuta", async () => {
      mockState.lastResponse = tap("/negociacao/r2");
      const aberturas: Array<string | null> = [];
      service.subscribeToOpened(({ url }) => aberturas.push(url));
      await new Promise((resolve) => setTimeout(resolve, 0));
      mockState.lastResponse = null;
      expect(aberturas).toEqual(["/negociacao/r2"]);
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

    it("usa 60 min de antecedência por padrão no lembrete nativo (Spec 060)", async () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const id = await service.scheduleMeetingReminder({
        meetingId: "m-expo-2",
        bookTitle: "Vidas Secas",
        locationName: "Praça da Matriz",
        scheduledAt: futureDate,
      });
      expect(id).toBe("mock-notification-id");
    });

    it("não agenda lembrete quando a data é inválida ou o encontro já passou", async () => {
      const invalido = await service.scheduleMeetingReminder({
        meetingId: "m-inv",
        bookTitle: "b",
        locationName: "l",
        scheduledAt: "nao-e-data",
      });
      expect(invalido).toBeNull();

      const passado = new Date(Date.now() - 60_000).toISOString();
      const antigo = await service.scheduleMeetingReminder({
        meetingId: "m-pass",
        bookTitle: "b",
        locationName: "l",
        scheduledAt: passado,
        advanceMinutes: 30,
      });
      expect(antigo).toBeNull();
    });

    it("no web, trata permissões negadas sem derrubar o registro (Spec 060)", async () => {
      const osAnterior = Platform.OS;
      Platform.OS = "web";
      try {
        expect(await service.getPermissions()).toBe(false);
        expect(await service.requestPermissions()).toBe(false);
        expect(await service.registerForPushNotifications()).toBeNull();
      } finally {
        Platform.OS = osAnterior;
      }
    });

    it("no web com Notification, reflete a permissão concedida e negada (Spec 060)", async () => {
      const osAnterior = Platform.OS;
      const winAnterior = (globalThis as { window?: unknown }).window;
      const notifAnterior = (globalThis as { Notification?: unknown }).Notification;
      Platform.OS = "web";
      try {
        const api = { permission: "granted", requestPermission: async () => "granted" };
        (globalThis as { Notification?: unknown }).Notification = api;
        (globalThis as { window?: unknown }).window = { Notification: api };
        expect(await service.getPermissions()).toBe(true);
        expect(await service.requestPermissions()).toBe(true);

        const negado = { permission: "denied", requestPermission: async () => "denied" };
        (globalThis as { Notification?: unknown }).Notification = negado;
        (globalThis as { window?: unknown }).window = { Notification: negado };
        expect(await service.getPermissions()).toBe(false);
        expect(await service.requestPermissions()).toBe(false);
      } finally {
        Platform.OS = osAnterior;
        (globalThis as { window?: unknown }).window = winAnterior;
        (globalThis as { Notification?: unknown }).Notification = notifAnterior;
      }
    });

    it("reaproveita a inicialização em chamadas seguidas (Spec 060)", async () => {
      const primeira = await service.scheduleLocalNotification({ title: "a", body: "a", triggerSeconds: 5 });
      const segunda = await service.scheduleLocalNotification({ title: "b", body: "b", triggerSeconds: 5 });
      expect(primeira).toBe("mock-notification-id");
      expect(segunda).toBe("mock-notification-id");
    });

    it("retorna nulo quando o token do Expo falha (Spec 060)", async () => {
      const mod = createRequire(import.meta.url)("expo-notifications") as {
        getExpoPushTokenAsync: () => Promise<{ data: string }>;
      };
      const original = mod.getExpoPushTokenAsync;
      mod.getExpoPushTokenAsync = async () => {
        throw new Error("sem token");
      };
      try {
        expect(await service.registerForPushNotifications()).toBeNull();
      } finally {
        mod.getExpoPushTokenAsync = original;
      }
    });

    it("falha ao cancelar quando o runtime lança erro (Spec 060)", async () => {
      const mod = createRequire(import.meta.url)("expo-notifications") as {
        cancelScheduledNotificationAsync: (id: string) => Promise<void>;
      };
      const original = mod.cancelScheduledNotificationAsync;
      mod.cancelScheduledNotificationAsync = async () => {
        throw new Error("falhou");
      };
      try {
        expect(await service.cancelScheduledNotification("x")).toBe(false);
      } finally {
        mod.cancelScheduledNotificationAsync = original;
      }
    });

    it("sincroniza o selo do app com as não lidas (Spec 099)", async () => {
      await service.setBadgeCount(5);
      expect(mockState.lastBadge).toBe(5);

      await service.setBadgeCount(0);
      expect(mockState.lastBadge).toBe(0);
    });

    it("cria os canais do Android com prioridade e vibração por categoria (Spec 099)", async () => {
      const osAnterior = Platform.OS;
      Platform.OS = "android";
      mockState.channels.length = 0;
      try {
        await new ExpoPushNotificationService().registerForPushNotifications();
      } finally {
        Platform.OS = osAnterior;
      }
      const ids = mockState.channels.map((c) => c.channelId);
      expect(ids).toEqual(expect.arrayContaining(["messages", "reminders", "updates", "default"]));
      const messages = mockState.channels.find((c) => c.channelId === "messages")?.channel as {
        importance: number;
        enableVibrate: boolean;
      };
      expect(messages.importance).toBe(Notifications.AndroidImportance.HIGH);
      expect(messages.enableVibrate).toBe(true);
      const updates = mockState.channels.find((c) => c.channelId === "updates")?.channel as {
        importance: number;
        enableVibrate: boolean;
      };
      expect(updates.importance).toBe(Notifications.AndroidImportance.DEFAULT);
      expect(updates.enableVibrate).toBe(false);
    });

    it("não quebra quando o runtime não tem o módulo de notificações", async () => {
      const semNativo = new ExpoPushNotificationService();
      await expect(semNativo.setBadgeCount(2)).resolves.toBeUndefined();
    });

    it("agenda com canal mas sem atraso usa trigger de 1 segundo no canal pedido (Spec 099)", async () => {
      const id = await service.scheduleLocalNotification({
        title: "Aviso",
        body: "Sem atraso",
        channelId: "messages",
      });
      expect(id).toBe("mock-notification-id");
    });

    it("agenda sem atraso nem canal com trigger nulo (Spec 099)", async () => {
      const id = await service.scheduleLocalNotification({ title: "Aviso", body: "Imediato" });
      expect(id).toBe("mock-notification-id");
    });
  });
});
