import { useEffect, useRef } from "react";
import type { IPushNotificationService } from "@/model/services/iPushNotificationService";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";

/** Só abre rotas internas do app: ignora endereço externo ou vazio vindo de uma notificação. */
export function internalRouteOf(url: string | null): string | null {
  return url && /^\/[A-Za-z0-9/_\-?=&%.]*$/.test(url) && !url.startsWith("//") ? url : null;
}

/**
 * Notificações push (Spec 096): depois do login, obtém o token do Expo e o grava nas preferências uma só vez;
 * ao tocar numa notificação, abre a rota do aviso. Qualquer falha é silenciosa: o app segue sem push (CA2).
 * O token só é pedido com a permissão concedida (`permissionReady`), senão o próprio Expo abriria o aviso
 * nativo sem explicação — a Spec 020 pede a tela de motivo antes (CA2).
 */
export function usePushRegistration(
  sessionUserId: string | null,
  onOpenRoute: (route: string) => void,
  push: IPushNotificationService,
  preferences: IUserPreferencesUseCases,
  permissionReady: boolean,
): void {
  const openRoute = useRef(onOpenRoute);
  openRoute.current = onOpenRoute;
  const registeredUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionUserId) {
      registeredUserId.current = null;
      return;
    }
    if (!permissionReady) return;
    if (registeredUserId.current === sessionUserId) return;
    registeredUserId.current = sessionUserId;

    let active = true;
    void (async () => {
      try {
        const token = await push.registerForPushNotifications();
        if (!active || !token) return;
        const current = await preferences.getPreferences(sessionUserId);
        if (!active || current.pushToken === token) return;
        await preferences.updatePreferences(sessionUserId, { pushToken: token });
      } catch {
        // Sem push: o aviso continua aparecendo dentro do app.
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionUserId, permissionReady, push, preferences]);

  useEffect(() => {
    if (!sessionUserId) return;
    return push.subscribeToOpened(({ url }) => {
      const route = internalRouteOf(url);
      if (route) openRoute.current(route);
    });
  }, [sessionUserId, push]);
}
