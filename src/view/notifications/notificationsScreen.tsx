import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import Notifications from "@/view/notifications/notifications";

export type NotificationsScreenProps = {
  onBack: () => void;
  onNavigateToLogin: () => void;
  onNavigateToAction: (actionUrl: string) => void;
  /** Ação do estado vazio; sem ela o botão "Explorar livros" cairia no retorno. */
  onExploreBooks: () => void;
};

export default function NotificationsScreen({
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
  onExploreBooks,
}: NotificationsScreenProps) {
  const [authState] = useAuthViewModel();

  return (
    <Notifications
      sessionUserId={authState.user?.id ?? null}
      onBack={onBack}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToAction={onNavigateToAction}
      onExploreBooks={onExploreBooks}
    />
  );
}
