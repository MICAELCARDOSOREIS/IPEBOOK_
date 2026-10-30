import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import Profile from "@/view/profile/profile";

export default function EditarPerfilRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <Profile
        onNavigateToSignIn={() => replaceOnce("/entrar")}
        onBack={() => backOnce()}
      />
    </RequireAuth>
  );
}
