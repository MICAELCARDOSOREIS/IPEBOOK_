import { router } from "expo-router";
import Profile from "@/view/profile/profile";

export default function Perfil() {
  return <Profile onNavigateToSignIn={() => router.replace("/entrar")} />;
}
