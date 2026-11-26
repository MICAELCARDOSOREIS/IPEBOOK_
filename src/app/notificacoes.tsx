import type { Href } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  const focusKey = useRefocusKey();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <NotificationsScreen
        focusKey={focusKey}
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
