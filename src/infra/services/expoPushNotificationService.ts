import { Platform } from "react-native";
import Constants from "expo-constants";
import type * as NotificationsType from "expo-notifications";
import type { NotificationChannel } from "@/model/entities/notification";
import type {
  IPushNotificationService,
  MeetingReminderParams,
  NotificationScheduleOptions,
} from "@/model/services/iPushNotificationService";
import type { ILogger } from "@/model/services/iLogger";

/**
 * Canais de entrega (Spec 099 / ADR 0075), espelhando `NOTIFICATION_CHANNEL` do modelo. Cada um tem
 * comportamento próprio no Android: `messages` e `reminders` interrompem (heads-up, som e vibração);
 * `updates` é discreto. O canal legacy `default` fica em baixa importância para não repetir o brilho
 * e o toque que antes valiam para tudo.
 */
const CHANNEL_PRESETS: Record<
  NotificationChannel | "default",
  { name: string; importance: "high" | "default"; vibration: boolean }
> = {
  messages: { name: "Conversas e propostas", importance: "high", vibration: true },
  reminders: { name: "Lembretes de encontro", importance: "high", vibration: true },
  updates: { name: "Avisos e novidades", importance: "default", vibration: false },
  default: { name: "Lembretes e Avisos Ipebook", importance: "default", vibration: false },
};

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
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });

      if (Platform.OS === "android") {
        for (const [channelId, preset] of Object.entries(CHANNEL_PRESETS)) {
          await Notifications.setNotificationChannelAsync(channelId, {
            name: preset.name,
            importance:
              preset.importance === "high"
                ? Notifications.AndroidImportance.HIGH
                : Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: preset.vibration ? [0, 250, 250, 250] : undefined,
            lightColor: preset.vibration ? "#2C5E45" : undefined,
            enableVibrate: preset.vibration,
            showBadge: true,
          });
        }
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
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId ??
        "7593e188-168b-4282-87b9-74afae861981";

      const tokenResult = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      return tokenResult.data;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = (err as Error)?.message ?? "";
      if (code === "E_REGISTRATION_FAILED" || message.includes("E_REGISTRATION_FAILED")) {
        // Esperado em emuladores, simuladores ou dispositivos sem Google Play Services (Spec 096, CA2)
        this.logger?.info("Push remoto não disponível no ambiente atual (emulador ou sem Google Play Services)", { code });
      } else {
        this.logger?.warn("Não foi possível obter o token Expo Push", { err });
      }
      return null;
    }
  }

  subscribeToOpened(listener: (target: { url: string | null }) => void): () => void {
    const Notifications = getNotificationsModule();
    if (!Notifications) return () => {};
    const notify = (response: NotificationsType.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url;
      listener({ url: typeof url === "string" ? url : null });
    };
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => notify(response));
    // App aberto pelo toque, estando fechado: a resposta já chegou antes do listener existir.
    void Notifications.getLastNotificationResponseAsync?.().then((response) => {
      if (response) notify(response);
    }).catch(() => {});
    return () => subscription.remove();
  }

  async scheduleLocalNotification(options: NotificationScheduleOptions): Promise<string | null> {
    const Notifications = await this.ensureInitialized();
    if (!Notifications) return null;

    try {
      const seconds = options.triggerSeconds && options.triggerSeconds > 0 ? options.triggerSeconds : null;
      // No expo-notifications o canal Android vai no *trigger*, não no conteúdo.
      const trigger: NotificationsType.NotificationTriggerInput =
        seconds !== null
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
              repeats: false,
              channelId: options.channelId ?? "default",
            }
          : options.channelId
            ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 1,
                repeats: false,
                channelId: options.channelId,
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
      channelId: "reminders",
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

  async setBadgeCount(count: number): Promise<void> {
    const Notifications = getNotificationsModule();
    if (!Notifications) return;
    try {
      // iOS reflete o selo no ícone; no Android o selo é controlado pelo canal e a chamada é tolerada.
      await Notifications.setBadgeCountAsync(Math.max(0, Math.trunc(count)));
    } catch (err) {
      this.logger?.warn("Não foi possível ajustar o selo de notificações", { err });
    }
  }
}
