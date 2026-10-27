import { type Href, useRouter } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      onBack={() => backOnce()}
      onNavigateToLogin={() => pushOnce("/entrar")}
      onNavigateToAction={(actionUrl) => {
        if (actionUrl && actionUrl.startsWith("/")) {
          pushOnce(actionUrl as Href);
        }
      }}
    />
  );
}
