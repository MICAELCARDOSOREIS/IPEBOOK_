/**
 * IpêBook — Interface do Serviço de Notificações Push e Locais (Spec 060 / ADR 0043).
 * Pertence estritamente à camada de Modelo (model/services).
 */

export type NotificationScheduleOptions = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  triggerSeconds?: number;
};

export type MeetingReminderParams = {
  meetingId: string;
  bookTitle: string;
  locationName: string;
  scheduledAt: string; // ISO 8601 string ou data válida
  advanceMinutes?: number; // Padrão: 60 minutos de antecedência
};

export interface IPushNotificationService {
  /**
   * Consulta o estado atual de permissão de notificações do dispositivo.
   */
  getPermissions(): Promise<boolean>;

  /**
   * Solicita permissão de notificações ao usuário de forma contextual.
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Obtém o token do Expo Push para comunicação remota (opcional).
   */
  registerForPushNotifications(): Promise<string | null>;

  /**
   * Agenda uma notificação local imediata ou para daqui a N segundos.
   */
  scheduleLocalNotification(options: NotificationScheduleOptions): Promise<string | null>;

  /**
   * Agenda um lembrete local para encontro presencial com antecedência calculada.
   */
  scheduleMeetingReminder(params: MeetingReminderParams): Promise<string | null>;

  /**
   * Cancela uma notificação local agendada.
   */
  cancelScheduledNotification(notificationId: string): Promise<boolean>;
}
