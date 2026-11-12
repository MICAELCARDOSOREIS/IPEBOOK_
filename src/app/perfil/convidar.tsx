import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { InviteFriends } from "@/view/profile/inviteFriends";

export default function ConvidarRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <InviteFriends onBack={() => backOnce()} />
    </RequireAuth>
  );
}
