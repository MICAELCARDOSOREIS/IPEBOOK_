import { type Href } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

export default function NotificationsRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <NotificationsScreen
        onBack={() => backOnce()}
        onNavigateToLogin={() => pushOnce("/entrar")}
        onNavigateToAction={(actionUrl) => {
          if (actionUrl && actionUrl.startsWith("/")) {
            pushOnce(actionUrl as Href);
          }
        }}
      />
    </RequireAuth>
  );
}
