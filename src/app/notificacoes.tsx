import { useRouter } from "expo-router";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      onBack={() => router.back()}
      onNavigateToLogin={() => router.push("/entrar")}
      onNavigateToAction={(actionUrl) => router.push(actionUrl as any)}
    />
  );
}
