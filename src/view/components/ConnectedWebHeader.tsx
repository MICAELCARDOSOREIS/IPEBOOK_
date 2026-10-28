import { useEffect } from "react";
import { WebHeader, type WebHeaderProps } from "@/view/components/WebHeader";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { useNavigationBadgesViewModel } from "@/viewmodel/useNavigationBadgesViewModel";

export type ConnectedWebHeaderProps = Omit<WebHeaderProps, "initials" | "badgeCount" | "notificationCount"> & {
  /** Rota atual: ao mudar de tela os selos são recalculados. */
  pathname: string;
};

function initialsOf(name?: string, email?: string): string {
  const source = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

/** Cabeçalho Web com avatar da pessoa logada, selo de propostas em "Conversas" e sino de notificações. */
export function ConnectedWebHeader({ pathname, ...props }: ConnectedWebHeaderProps) {
  const [auth] = useAuthViewModel();
  const badges = useNavigationBadgesViewModel(auth.user?.id ?? null, pathname);
  const [notifications, notificationsActions] = useNotificationsViewModel(auth.user?.id ?? null);
  // Ao mudar de tela o selo do sino é recalculado, como o das conversas.
  const { refresh } = notificationsActions;
  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);
  return (
    <WebHeader
      {...props}
      initials={initialsOf(auth.user?.name, auth.user?.email)}
      badgeCount={badges.conversations}
      notificationCount={notifications.unreadCount}
    />
  );
}
