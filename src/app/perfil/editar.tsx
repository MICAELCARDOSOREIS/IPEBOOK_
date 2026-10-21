import { router } from "expo-router";
import Profile from "@/view/profile/profile";

export default function EditarPerfilRoute() {
  return (
    <Profile
      onNavigateToSignIn={() => router.replace("/entrar")}
      onBack={() => router.back()}
    />
  );
}
