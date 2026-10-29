import { type Href, useRouter } from "expo-router";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      onBack={() => router.back()}
      onNavigateToLogin={() => router.push("/entrar")}
      onNavigateToAction={(actionUrl) => {
        if (actionUrl && actionUrl.startsWith("/")) {
          router.push(actionUrl as Href);
        }
      }}
    />
  );
}
