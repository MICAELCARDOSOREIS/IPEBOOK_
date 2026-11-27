import { useEffect } from "react";
import { makeAuthViewModel, makeNavigationBadgesViewModel, makeNotificationsViewModel, makeProfileViewModel } from "@/di/container";
import { WebHeader, type WebHeaderProps } from "@/view/components/WebHeader";

export type ConnectedWebHeaderProps = Omit<WebHeaderProps, "initials" | "photoUrl" | "badgeCount" | "notificationCount"> & {
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
  const [auth] = makeAuthViewModel();
  const userId = auth.user?.id ?? null;
  const [profile] = makeProfileViewModel(userId);
  const badges = makeNavigationBadgesViewModel(userId, pathname);
  const [notifications, notificationsActions] = makeNotificationsViewModel(userId);
  // Ao mudar de tela o selo do sino é recalculado, como o das conversas.
  const { refresh } = notificationsActions;
  useEffect(() => {
    if (userId) void refresh();
  }, [pathname, refresh, userId]);

  if (auth.loading || !auth.user) return null;

  return (
    <WebHeader
      {...props}
      initials={initialsOf(auth.user?.name, auth.user?.email)}
      photoUrl={profile.profile?.photoUrl}
      badgeCount={badges.conversations}
      notificationCount={notifications.unreadCount}
    />
  );
}
