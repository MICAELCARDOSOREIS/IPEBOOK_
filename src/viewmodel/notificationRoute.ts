import type { AppNotification } from "@/model/entities/notification";

/**
 * Resolve a rota de navegação de uma notificação com segurança e previsibilidade.
 * Se houver `actionUrl`, garante que inicie com "/" para compatibilidade com Expo Router.
 * Se não houver `actionUrl`, mapeia o tipo de notificação para a tela de destino correspondente.
 */
export function resolveNotificationRoute(notification: Pick<AppNotification, "type" | "actionUrl">): string {
  if (notification.actionUrl && notification.actionUrl.trim().length > 0) {
    const raw = notification.actionUrl.trim();
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  switch (notification.type) {
    case "request_received":
      return "/pedidos-recebidos";
    case "request_accepted":
    case "request_rejected":
    case "request_cancelled":
    case "meeting_update":
      return "/meus-pedidos";
    case "new_message":
      return "/conversas";
    case "rating_received":
      return "/perfil";
    case "favorite_update":
      return "/favoritos";
    case "search_alert_match":
      return "/pesquisa";
    case "safety_tip":
    case "system":
    default:
      return "/ajuda";
  }
}
