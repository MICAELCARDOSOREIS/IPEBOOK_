import type { Href } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <NotificationsScreen
        onBack={() => backOnce()}
        onNavigateToLogin={() => pushOnce("/entrar")}
        onExploreBooks={() => pushOnce("/")}
        onNavigateToAction={(actionUrl) => {
          if (!actionUrl) return;
          const destination = actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`;
          pushOnce(destination as Href);
        }}
      />
    </RequireAuth>
  );
}
