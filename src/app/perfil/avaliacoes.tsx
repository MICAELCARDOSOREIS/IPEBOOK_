import { router } from "expo-router";
import ReceivedRatingsScreen from "@/view/profile/receivedRatings";

export default function AvaliacoesRoute() {
  return (
    <ReceivedRatingsScreen
      onBack={() => router.back()}
      onNavigateToSignIn={() => router.replace("/entrar")}
    />
  );
}
