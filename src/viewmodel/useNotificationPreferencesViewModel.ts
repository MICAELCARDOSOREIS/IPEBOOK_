import { useCallback, useMemo, useState } from "react";
import { userPreferencesUseCases } from "@/di/container";
import type { NotificationType } from "@/model/entities/notification";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";

/**
 * Categoria de aviso que a pessoa liga ou desliga em Configurações (Spec 099 / ADR 0075).
 * Cada chave agrupa os tipos que ela controla; "ligado" significa receber o push desses tipos.
 */
export type NotificationPreferenceKey = "proposals" | "meetings" | "searchAlerts" | "system";

export const NOTIFICATION_PREFERENCE_CATEGORIES: Record<
  NotificationPreferenceKey,
  { label: string; description: string; types: readonly NotificationType[] }
> = {
  proposals: {
    label: "Propostas e mensagens",
    description: "Pedidos, respostas e mensagens novas no chat da negociação",
    types: ["request_received", "request_accepted", "request_rejected", "new_message"],
  },
  meetings: {
    label: "Lembretes de encontro",
    description: "Convites e avisos sobre a entrega combinada",
    types: ["meeting_update"],
  },
  searchAlerts: {
    label: "Novidades dos alertas de busca",
    description: "Livros novos que batem com os seus alertas",
    types: ["search_alert_match"],
  },
  system: {
    label: "Avisos do sistema",
    description: "Avaliações recebidas, segurança e comunicados do IpêBook",
    types: ["system", "safety_tip", "rating_received"],
  },
};

const KEYS = Object.keys(NOTIFICATION_PREFERENCE_CATEGORIES) as NotificationPreferenceKey[];

export type NotificationPreferencesState = {
  /** Categoria → recebe (true) ou não (false). Sem preferências carregadas, recebe tudo. */
  enabled: Record<NotificationPreferenceKey, boolean>;
  saving: boolean;
  error: string | null;
};

export type NotificationPreferencesActions = {
  setEnabled: (key: NotificationPreferenceKey, value: boolean) => Promise<void>;
};

/**
 * Preferências por tipo de aviso (Spec 099): mostra quatro chaves e grava em `muted_types` os tipos
 * desligados. Reusa `useUserPreferencesViewModel` para carregar e salvar as preferências do titular.
 */
export function useNotificationPreferencesViewModel(
  sessionUserId: string | null,
  useCases: IUserPreferencesUseCases = userPreferencesUseCases,
): [NotificationPreferencesState, NotificationPreferencesActions] {
  const [prefs, actions] = useUserPreferencesViewModel(sessionUserId, useCases);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const muted = useMemo(() => new Set<string>(prefs.preferences?.mutedTypes ?? []), [prefs.preferences]);

  const enabled = useMemo(() => {
    const result = {} as Record<NotificationPreferenceKey, boolean>;
    for (const key of KEYS) {
      const types = NOTIFICATION_PREFERENCE_CATEGORIES[key].types;
      // Ligado quando nenhum tipo da categoria está na lista de desativados.
      result[key] = !types.some((type) => muted.has(type));
    }
    return result;
  }, [muted]);

  const setEnabled = useCallback(
    async (key: NotificationPreferenceKey, value: boolean) => {
      const types = NOTIFICATION_PREFERENCE_CATEGORIES[key].types;
      const current = new Set<string>(prefs.preferences?.mutedTypes ?? []);
      for (const type of types) {
        if (value) current.delete(type);
        else current.add(type);
      }
      setFeedbackError(null);
      const saved = await actions.update({ mutedTypes: [...current] as NotificationType[] });
      if (!saved) setFeedbackError("Não foi possível salvar suas preferências de notificação.");
    },
    [actions, prefs.preferences],
  );

  return [
    {
      enabled,
      saving: prefs.saving,
      error: feedbackError ?? prefs.error,
    },
    { setEnabled },
  ];
}
