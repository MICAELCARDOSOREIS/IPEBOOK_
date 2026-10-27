import { backOnce, replaceOnce } from "@/view/pushOnce";
import Profile from "@/view/profile/profile";

export default function EditarPerfilRoute() {
  return (
    <Profile
      onNavigateToSignIn={() => replaceOnce("/entrar")}
      onBack={() => backOnce()}
    />
  );
}
