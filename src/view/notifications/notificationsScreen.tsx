import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import Notifications from "@/view/notifications/notifications";

export type NotificationsScreenProps = {
  onBack: () => void;
  onNavigateToLogin: () => void;
  onNavigateToAction: (actionUrl: string) => void;
};

export default function NotificationsScreen({
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
}: NotificationsScreenProps) {
  const [authState] = useAuthViewModel();

  return (
    <Notifications
      sessionUserId={authState.user?.id ?? null}
      onBack={onBack}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToAction={onNavigateToAction}
    />
  );
}
