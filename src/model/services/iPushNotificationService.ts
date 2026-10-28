/**
 * IpêBook — Interface do Serviço de Notificações Push e Locais (Spec 060 / ADR 0043).
 * Pertence estritamente à camada de Modelo (model/services).
 */

import type { NotificationChannel } from "@/model/entities/notification";

export type NotificationScheduleOptions = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  triggerSeconds?: number;
  /** Canal Android por onde o aviso local toca (Spec 099). Ausente = canal padrão. */
  channelId?: NotificationChannel;
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
   * Avisa quando a pessoa toca numa notificação (com o app aberto, em segundo plano ou fechado), com a rota
   * que o aviso carrega (Spec 096, CA3). Devolve o cancelamento.
   */
  subscribeToOpened(listener: (target: { url: string | null }) => void): () => void;

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

  /**
   * Ajusta o selo (badge) do ícone do app com o número de avisos não lidos (Spec 099).
   * No iOS reflete o contador; no Android o selo é por canal e a chamada é tolerada sem efeito.
   */
  setBadgeCount(count: number): Promise<void>; 
}
