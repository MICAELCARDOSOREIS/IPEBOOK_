import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { Security } from "@/view/profile/security";

export default function SegurancaRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <Security onBack={() => backOnce()} />
    </RequireAuth>
  );
}
