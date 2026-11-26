import { makeAuthViewModel } from "@/di/container";
import Notifications from "@/view/notifications/notifications";

export type NotificationsScreenProps = {
  focusKey?: number;
  onBack: () => void;
  onNavigateToLogin: () => void;
  onNavigateToAction: (actionUrl: string) => void;
  /** Ação do estado vazio; sem ela o botão "Explorar livros" cairia no retorno. */
  onExploreBooks: () => void;
};

export default function NotificationsScreen({
  focusKey,
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
  onExploreBooks,
}: NotificationsScreenProps) {
  const [authState] = makeAuthViewModel();

  return (
    <Notifications
      sessionUserId={authState.user?.id ?? null}
      sessionLoading={authState.loading}
      focusKey={focusKey}
      onBack={onBack}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToAction={onNavigateToAction}
      onExploreBooks={onExploreBooks}
    />
  );
}
