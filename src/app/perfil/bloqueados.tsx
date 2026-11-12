import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { BlockedUsers } from "@/view/profile/blockedUsers";

export default function BloqueadosRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <BlockedUsers onBack={() => backOnce()} />
    </RequireAuth>
  );
}
