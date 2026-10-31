import { type Href } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  return (
    <NotificationsScreen
      onBack={() => backOnce()}
      onNavigateToLogin={() => pushOnce("/entrar")}
      onNavigateToAction={(actionUrl) => {
        if (!actionUrl) return;
        const destination = actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`;
        pushOnce(destination as Href);
      }}
    />
  );
}
