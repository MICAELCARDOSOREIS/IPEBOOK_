import { Platform } from "react-native";
import type * as NotificationsType from "expo-notifications";
import type {
  IPushNotificationService,
  MeetingReminderParams,
  NotificationScheduleOptions,
} from "@/model/services/iPushNotificationService";
import type { ILogger } from "@/model/services/iLogger";

function getNotificationsModule(): typeof NotificationsType | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications");
  } catch {
    return null;
  }
}

/**
 * Implementação real do serviço de notificações push e locais com expo-notifications (Spec 060 / ADR 0043).
 * Contém proteção graciosa para ambientes como Expo Go onde submódulos nativos não estão compilados.
 */
export class ExpoPushNotificationService implements IPushNotificationService {
  private initialized = false;

  constructor(private readonly logger?: ILogger) {}

  private async ensureInitialized(): Promise<typeof NotificationsType | null> {
    const Notifications = getNotificationsModule();
    if (!Notifications) {
      this.logger?.warn("Módulo expo-notifications indisponível no runtime atual (ex: Expo Go sem client customizado)");
      return null;
    }

    if (this.initialized) return Notifications;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Lembretes e Avisos Ipebook",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2C5E45",
        });
      }

      this.initialized = true;
      return Notifications;
    } catch (err) {
      this.logger?.warn("Falha ao inicializar handler de notificações Expo", { err });
      return Notifications;
    }
  }

  async getPermissions(): Promise<boolean> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && "Notification" in window) {
        return Notification.permission === "granted";
      }
      return false;
    }

    const Notifications = getNotificationsModule();
    if (!Notifications) return false;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && "Notification" in window) {
        try {
          const perm = await Notification.requestPermission();
          return perm === "granted";
        } catch {
          return false;
        }
      }
      return false;
    }

    const Notifications = getNotificationsModule();
    if (!Notifications) return false;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    const Notifications = await this.ensureInitialized();
    if (!Notifications) return null;

    const hasPermission = await this.getPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return null;
    }

    try {
      const tokenResult = await Notifications.getExpoPushTokenAsync();
      return tokenResult.data;
    } catch (err) {
      this.logger?.warn("Não foi possível obter o token Expo Push", { err });
      return null;
    }
  }

  async scheduleLocalNotification(options: NotificationScheduleOptions): Promise<string | null> {
    const Notifications = await this.ensureInitialized();
    if (!Notifications) return null;

    try {
      const trigger: NotificationsType.NotificationTriggerInput =
        options.triggerSeconds && options.triggerSeconds > 0
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: options.triggerSeconds,
              repeats: false,
            }
          : null;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data ?? {},
          sound: true,
        },
        trigger,
      });

      return id;
    } catch (err) {
      this.logger?.warn("Erro ao agendar notificação local", { err });
      return null;
    }
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

    // Se o horário de lembrete com antecedência já passou, mas o encontro ainda não aconteceu:
    let triggerSeconds: number;
    if (diffSeconds <= 0) {
      const secondsUntilMeeting = Math.floor((meetingDate.getTime() - nowMs) / 1000);
      if (secondsUntilMeeting <= 0) {
        // Encontro já no passado, não agenda
        return null;
      }
      // Notifica em 5 segundos
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
    const Notifications = getNotificationsModule();
    if (!Notifications) return true;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch {
      return false;
    }
  }
}
