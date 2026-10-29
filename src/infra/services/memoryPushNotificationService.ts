import type {
  IPushNotificationService,
  MeetingReminderParams,
  NotificationScheduleOptions,
} from "@/model/services/iPushNotificationService";

export type StoredScheduledNotification = {
  id: string;
  options: NotificationScheduleOptions;
  createdAt: number;
};

/**
 * Implementação em memória do serviço de notificações push (Spec 060).
 * Utilizada para testes automatizados e ambientes sem suporte nativo.
 */
export class MemoryPushNotificationService implements IPushNotificationService {
  private permissionGranted: boolean;
  private pushToken: string | null;
  private scheduled = new Map<string, StoredScheduledNotification>();
  private nextId = 1;

  constructor(initialGranted = true, pushToken: string | null = "ExponentPushToken[mock-local-token]") {
    this.permissionGranted = initialGranted;
    this.pushToken = pushToken;
  }

  async getPermissions(): Promise<boolean> {
    return this.permissionGranted;
  }

  async requestPermissions(): Promise<boolean> {
    this.permissionGranted = true;
    return true;
  }

  setPermissions(granted: boolean): void {
    this.permissionGranted = granted;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!this.permissionGranted) return null;
    return this.pushToken;
  }

  async scheduleLocalNotification(options: NotificationScheduleOptions): Promise<string | null> {
    if (!this.permissionGranted) return null;
    const id = `local-notification-${this.nextId++}`;
    this.scheduled.set(id, {
      id,
      options,
      createdAt: Date.now(),
    });
    return id;
  }

  async scheduleMeetingReminder(params: MeetingReminderParams): Promise<string | null> {
    const meetingDate = new Date(params.scheduledAt);
    if (Number.isNaN(meetingDate.getTime())) {
      return null;
    }

    const advanceMs = (params.advanceMinutes ?? 60) * 60 * 1000;
    const reminderTimeMs = meetingDate.getTime() - advanceMs;
    const nowMs = Date.now();
    const diffSeconds = Math.floor((reminderTimeMs - nowMs) / 1000);

    let triggerSeconds: number;
    if (diffSeconds <= 0) {
      const secondsUntilMeeting = Math.floor((meetingDate.getTime() - nowMs) / 1000);
      if (secondsUntilMeeting <= 0) {
        return null;
      }
      triggerSeconds = 5;
    } else {
      triggerSeconds = diffSeconds;
    }

    return this.scheduleLocalNotification({
      title: "Lembrete de Encontro no Ponto Seguro",
      body: `Seu encontro para a entrega do livro "${params.bookTitle}" em ${params.locationName} acontecerá em breve!`,
      data: {
        meetingId: params.meetingId,
        type: "meeting_update",
      },
      triggerSeconds,
    });
  }

  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    return this.scheduled.delete(notificationId);
  }

  getScheduledNotifications(): readonly StoredScheduledNotification[] {
    return Array.from(this.scheduled.values());
  }

  clear(): void {
    this.scheduled.clear();
    this.nextId = 1;
  }
}
